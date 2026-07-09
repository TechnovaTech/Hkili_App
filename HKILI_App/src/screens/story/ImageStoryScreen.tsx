import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { uploadService } from '@/services/uploadService';
import { storyService } from '@/services/storyService';
import { playClickSound } from '@/utils/soundUtils';

const { width } = Dimensions.get('window');
const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

export default function ImageStoryScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    language: string;
    categoryId: string;
    mainCharacterIds: string;
    place: string;
  }>();
  const { language, categoryId, mainCharacterIds, place } = params;

  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const tileSize = (width - 40 - 24) / 3; // 3 columns, 20 padding each side, gaps

  useEffect(() => {
    if (!submitting) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [submitting]);

  const pickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('storyFlow.imageTitle'), t('voice.micDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const stageKey =
    elapsed < 8 ? 'storyFlow.imgStatusUploading'
      : elapsed < 30 ? 'storyFlow.imgStatusWriting'
        : 'storyFlow.imgStatusFinishing';

  const canGenerate = images.length >= MIN_IMAGES && !submitting;

  const handleGenerate = async () => {
    if (images.length < MIN_IMAGES) {
      Alert.alert(t('storyFlow.imageTitle'), t('storyFlow.imageMin'));
      return;
    }
    await playClickSound();
    setSubmitting(true);
    setElapsed(0);
    try {
      // Upload all local images to Cloudinary, preserving order.
      const uploaded = await Promise.all(
        images.map((uri) => uploadService.uploadImageToCloudinary(uri))
      );
      const urls = uploaded.filter((u): u is string => !!u);
      if (urls.length < MIN_IMAGES) {
        setSubmitting(false);
        Alert.alert(t('storyFlow.imageTitle'), t('voice.uploadError'));
        return;
      }

      const mainIds = mainCharacterIds ? JSON.parse(mainCharacterIds) : [];
      const res = await storyService.generateFromImages({
        images: urls,
        description: description.trim() || undefined,
        language: language || 'EN',
        categoryId: categoryId || undefined,
        mainCharacterIds: mainIds,
        place: place || undefined,
      });

      if (res.success && res.data) {
        const storyId = res.data._id || res.data.id;
        storyService.addToLibrary(storyId).catch(() => {}).finally(() => {
          router.replace({ pathname: '/story/viewer', params: { storyId } });
        });
      } else {
        setSubmitting(false);
        Alert.alert(t('storyFlow.imageTitle'), res.error || t('storyFlow.genFailed'));
      }
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert(t('storyFlow.imageTitle'), err?.message || t('storyFlow.genFailed'));
    }
  };

  // Full-screen generating overlay
  if (submitting) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loadingGlow}
          >
            <Text style={{ fontSize: 56 }}>🎨</Text>
          </LinearGradient>
          <Text style={styles.timer}>{fmtTime(elapsed)}</Text>
          <Text style={styles.stageText}>{t(stageKey)}</Text>
          <Text style={styles.waitText}>{t('storyFlow.genWait')}</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('storyFlow.imageTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          <Text style={styles.subtitle}>{t('storyFlow.imageSubtitle')}</Text>

          {/* Image grid */}
          <View style={styles.grid}>
            {images.map((uri, i) => (
              <View key={`${uri}-${i}`} style={[styles.tile, { width: tileSize, height: tileSize }]}>
                <Image source={{ uri }} style={styles.tileImage} />
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>{i + 1}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < MAX_IMAGES && (
              <TouchableOpacity
                style={[styles.addTile, { width: tileSize, height: tileSize }]}
                onPress={pickImages}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={30} color={theme.colors.primary} />
                <Text style={styles.addTileText}>{t('storyFlow.imageAdd')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.counter}>{images.length}/{MAX_IMAGES}</Text>

          {/* Description */}
          <Text style={styles.label}>{t('storyFlow.imageDescLabel')}</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={t('storyFlow.imageDescPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateWrapper, canGenerate && styles.generateGlow]}
            onPress={handleGenerate}
            disabled={!canGenerate}
            activeOpacity={0.85}
          >
            {canGenerate ? (
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.generateBtn}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateText}>{t('storyFlow.imageCreate')}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.generateBtn, styles.generateDisabled]}>
                <Ionicons name="sparkles-outline" size={20} color={theme.colors.text} />
                <Text style={styles.generateText}>{t('storyFlow.imageCreate')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, flex: 1, textAlign: 'center', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { borderRadius: 14, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.06)' },
  tileImage: { width: '100%', height: '100%' },
  orderBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  orderBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  removeBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(244,67,54,0.9)', width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  addTile: {
    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(129, 199, 132, 0.4)', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', gap: 4,
  },
  addTileText: { color: theme.colors.primary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  counter: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 8, marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: 'rgba(129, 199, 132, 0.15)',
  },
  generateWrapper: { borderRadius: 16, overflow: 'hidden' },
  generateGlow: { overflow: 'visible', ...theme.shadows.glow },
  generateBtn: { flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  generateDisabled: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  generateText: { fontSize: 17, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5 },

  // Loading overlay
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 30 },
  loadingGlow: {
    width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(0, 230, 118, 0.4)', ...theme.shadows.glow,
  },
  timer: { fontSize: 40, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  stageText: { color: '#00E676', fontSize: 15, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  waitText: { color: '#8899A6', fontSize: 13, textAlign: 'center' },
});
