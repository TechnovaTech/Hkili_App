import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';
import { voiceService } from '../../services/voiceService';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { VoiceProfile } from '@/types';
import { theme } from '@/theme';

type RecState = 'idle' | 'recording' | 'recorded';

export default function MyVoiceScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();

  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [recState, setRecState] = useState<RecState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const sampleUriRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storyLang = (i18n.language || 'en').toLowerCase().slice(0, 2).toUpperCase();

  const loadVoices = useCallback(async () => {
    try {
      const res = await voiceService.listVoices();
      if (res.success && res.data) setVoices(res.data);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVoices();
      return () => {
        // Cleanup audio when leaving the screen.
        cleanupRecording();
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      };
    }, [loadVoices])
  );

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
  };

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('voice.title'), t('voice.micDenied'));
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setRecState('recording');
      startTimer();
    } catch (e) {
      console.error('startRecording error:', e);
      Alert.alert(t('voice.title'), t('voice.recordError'));
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const recording = recordingRef.current;
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      sampleUriRef.current = recording.getURI();
      recordingRef.current = null;
      setRecState('recorded');
    } catch (e) {
      console.error('stopRecording error:', e);
      Alert.alert(t('voice.title'), t('voice.recordError'));
    }
  };

  const previewSample = async () => {
    try {
      if (!sampleUriRef.current) return;
      if (previewing && soundRef.current) {
        await soundRef.current.stopAsync();
        setPreviewing(false);
        return;
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: sampleUriRef.current },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPreviewing(true);
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) setPreviewing(false);
      });
    } catch (e) {
      console.error('previewSample error:', e);
    }
  };

  const resetRecording = () => {
    cleanupRecording();
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    sampleUriRef.current = null;
    setElapsed(0);
    setPreviewing(false);
    setRecState('idle');
  };

  const saveVoice = async () => {
    if (saving) return;
    if (!name.trim()) {
      Alert.alert(t('voice.title'), t('voice.nameRequired'));
      return;
    }
    if (!sampleUriRef.current) return;
    if (elapsed < 5) {
      Alert.alert(t('voice.title'), t('voice.tooShort'));
      return;
    }
    setSaving(true);
    try {
      const sampleUrl = await voiceService.uploadSampleToCloudinary(sampleUriRef.current);
      if (!sampleUrl) {
        Alert.alert(t('voice.title'), t('voice.uploadError'));
        return;
      }
      const res = await voiceService.cloneVoice({
        name: name.trim(),
        sampleUrl,
        language: storyLang,
      });
      if (res.success && res.data) {
        setVoices((prev) => [res.data!, ...prev]);
        resetRecording();
        setName('');
        Alert.alert(t('voice.title'), t('voice.cloneSuccess'));
      } else {
        Alert.alert(t('voice.title'), res.message || res.error || t('voice.cloneError'));
      }
    } catch {
      Alert.alert(t('voice.title'), t('voice.cloneError'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (voice: VoiceProfile) => {
    Alert.alert(
      t('voice.deleteTitle'),
      t('voice.deleteMessage', { name: voice.name }),
      [
        { text: t('voice.cancel'), style: 'cancel' },
        {
          text: t('voice.delete'),
          style: 'destructive',
          onPress: () => doDelete(voice.id),
        },
      ]
    );
  };

  const doDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await voiceService.deleteVoice(id);
      if (res.success) {
        setVoices((prev) => prev.filter((v) => v.id !== id));
      } else {
        Alert.alert(t('voice.deleteTitle'), res.message || res.error || t('voice.deleteError'));
      }
    } catch {
      Alert.alert(t('voice.deleteTitle'), t('voice.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.header, { flexDirection }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('voice.title')}</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.subtitle, { textAlign }]}>{t('voice.subtitle')}</Text>

        {/* Recorder card */}
        <View style={styles.recorderCard}>
          <LinearGradient
            colors={recState === 'recording' ? theme.gradients.highlight : theme.gradients.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.micCircle}
          >
            <Ionicons
              name={recState === 'recording' ? 'mic' : 'mic-outline'}
              size={40}
              color={recState === 'recording' ? '#F44336' : theme.colors.primary}
            />
          </LinearGradient>

          {recState === 'recording' && (
            <Text style={styles.timer}>{fmt(elapsed)}</Text>
          )}
          {recState === 'recorded' && (
            <Text style={styles.recordedLabel}>{t('voice.recorded', { time: fmt(elapsed) })}</Text>
          )}
          {recState === 'idle' && (
            <Text style={[styles.hint, { textAlign: 'center' }]}>{t('voice.recordHint')}</Text>
          )}

          {/* Controls */}
          {recState === 'idle' && (
            <TouchableOpacity style={styles.primaryBtnWrapper} onPress={startRecording} activeOpacity={0.85}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Ionicons name="mic" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('voice.startRecording')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {recState === 'recording' && (
            <TouchableOpacity style={[styles.primaryBtnWrapper, styles.stopBtnWrapper]} onPress={stopRecording} activeOpacity={0.85}>
              <LinearGradient
                colors={['#FF6B6B', '#F44336', '#C62828']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Ionicons name="stop" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('voice.stopRecording')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {recState === 'recorded' && (
            <>
              <View style={[styles.recordedActions, { flexDirection }]}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={previewSample}>
                  <Ionicons name={previewing ? 'pause' : 'play'} size={18} color={theme.colors.primary} />
                  <Text style={styles.secondaryBtnText}>{t('voice.preview')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={resetRecording}>
                  <Ionicons name="refresh" size={18} color={theme.colors.primary} />
                  <Text style={styles.secondaryBtnText}>{t('voice.reRecord')}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { textAlign }]}
                value={name}
                onChangeText={setName}
                placeholder={t('voice.namePlaceholder')}
                placeholderTextColor="#6B7280"
              />

              <TouchableOpacity
                style={[styles.primaryBtnWrapper, saving && { opacity: 0.6 }]}
                onPress={saveVoice}
                disabled={saving}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryBtn}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                      <Text style={styles.primaryBtnText}>{t('voice.saveVoice')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Saved voices */}
        <Text style={[styles.sectionTitle, { textAlign }]}>{t('voice.myVoices')}</Text>
        {loadingList ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : voices.length === 0 ? (
          <Text style={[styles.emptyText, { textAlign }]}>{t('voice.noVoices')}</Text>
        ) : (
          voices.map((v) => (
            <View key={v.id} style={[styles.voiceItem, { flexDirection }]}>
              <Ionicons name="person-circle-outline" size={28} color={theme.colors.primary} />
              <View style={[styles.voiceInfo, {
                marginLeft: isRTL ? 0 : 12,
                marginRight: isRTL ? 12 : 0,
                alignItems: isRTL ? 'flex-end' : 'flex-start',
              }]}>
                <Text style={[styles.voiceName, { textAlign }]}>{v.name}</Text>
                <Text style={[styles.voiceMeta, { textAlign }]}>{v.language} · {t('voice.ready')}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(v)} disabled={deletingId === v.id}>
                {deletingId === v.id ? (
                  <ActivityIndicator color="#F44336" />
                ) : (
                  <Ionicons name="trash-outline" size={22} color="#F44336" />
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },
  iconBtn: { padding: 5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  recorderCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  micCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    ...theme.shadows.glow,
  },
  timer: { fontSize: 28, fontWeight: 'bold', color: '#F44336', marginBottom: 16 },
  recordedLabel: { fontSize: 15, color: theme.colors.primary, marginBottom: 16 },
  hint: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20, lineHeight: 19 },
  primaryBtnWrapper: {
    borderRadius: 12,
    overflow: 'visible',
    width: '100%',
    ...theme.shadows.glow,
  },
  stopBtnWrapper: {
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 0,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  recordedActions: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.3)',
    ...theme.shadows.sm,
  },
  secondaryBtnText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#fff',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 12, letterSpacing: 0.3 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 8 },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  voiceInfo: { flex: 1, marginLeft: 12 },
  voiceName: { fontSize: 16, color: '#fff', fontWeight: '600', marginBottom: 2 },
  voiceMeta: { fontSize: 13, color: theme.colors.textSecondary },
});
