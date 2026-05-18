import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storyService } from '@/services/storyService';
import { authService } from '@/services/authService';
import { Story } from '@/types';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';

export default function StoryLibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  // navbar: paddingVertical(24) + icon(24) + gap(4) + text(16) = 68px + safe area bottom
  const listBottomPadding = 68 + insets.bottom + 16;

  const fetchUserCoins = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setCoins(res.data.coins || 0);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await storyService.getLibraryStories();
      if (response.success && response.data) {
        setStories(response.data);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching library:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
      fetchUserCoins();
    }, [])
  );

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={[styles.storyCard, { flexDirection }]}
      onPress={() => router.push({
        pathname: '/story/viewer',
        params: { storyId: item.id }
      })}
    >
      <View style={styles.storyImage}>
        <Text style={styles.storyEmoji}>📚</Text>
      </View>
      <View style={[styles.storyContent, { 
        marginLeft: isRTL ? 0 : 16, 
        marginRight: isRTL ? 16 : 0,
        alignItems: isRTL ? 'flex-end' : 'flex-start'
      }]}>
        <Text style={[styles.storyTitle, { textAlign }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.storyGenre, { textAlign }]}>{item.genre || 'Story'}</Text>
        <Text style={[styles.storyInfo, { textAlign }]}>
          {item.childName}, {t('library.yearsOld', { age: item.childAge })}
        </Text>
        <Text style={[styles.storyDate, { textAlign }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name={isRTL ? "play-back" : "play"} size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={[styles.header, { flexDirection }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>{t('library.myStories')}</Text>
        <View style={[styles.coinsContainer, { flexDirection }]}>
          <Text style={styles.coinsText}>{coins}</Text>
          <Ionicons name="layers-outline" size={20} color="#4CAF50" />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id || (item as any)._id || Math.random().toString()}
          contentContainerStyle={[styles.storiesList, { paddingBottom: listBottomPadding }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="book-outline" size={60} color="#81C784" />
              </View>
              <Text style={styles.emptyText}>No stories yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first story to get started!
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={() => router.push('/(tabs)/home')}>
                <Text style={styles.createButtonText}>Create Story</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  storyEmoji: {
    fontSize: 28,
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  storyGenre: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  storyInfo: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  storyDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});