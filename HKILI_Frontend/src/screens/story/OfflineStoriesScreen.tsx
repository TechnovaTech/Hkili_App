import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { StoryCard } from '@/components/story/StoryCard';
import { Loading } from '@/components/ui/Loading';
import { theme } from '@/theme';
import { Story } from '@/types';
import { offlineStorageService } from '@/services/offlineStorageService';
import { storyService } from '@/services/storyService';

export default function OfflineStoriesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOfflineStories();
  }, []);

  const loadOfflineStories = async () => {
    try {
      setLoading(true);
      const offlineStories = await offlineStorageService.getOfflineStories();
      setStories(offlineStories);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to load offline stories');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOfflineStories();
    setRefreshing(false);
  };

  const handleStoryPress = (story: Story) => {
    router.push({
      pathname: '/story/viewer',
      params: { storyId: story.id },
    });
  };

  const handleToggleFavorite = async (story: Story) => {
    try {
      const response = await storyService.toggleFavorite(story.id);
      
      if (response.success && response.data) {
        setStories(prevStories =>
          prevStories.map(s =>
            s.id === story.id
              ? { ...s, isFavorite: response.data!.isFavorite }
              : s
          )
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to update favorite status');
    }
  };

  const handleRemoveOffline = async (story: Story) => {
    Alert.alert(
      'Remove from Offline',
      `Remove "${story.title}" from offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineStorageService.removeOfflineStory(story.id);
              setStories(prevStories =>
                prevStories.filter(s => s.id !== story.id)
              );
              Alert.alert('Success', 'Story removed from offline storage');
            } catch (error) {
              Alert.alert(t('common.error'), 'Failed to remove story');
            }
          },
        },
      ]
    );
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <StoryCard
      story={item}
      onPress={() => handleStoryPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item)}
      onDownload={() => handleRemoveOffline(item)}
    />
  );

  if (loading) {
    return <Loading fullScreen message="Loading offline stories..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.offlineStories')}</Text>
        <Text style={styles.subtitle}>
          Stories available without internet connection
        </Text>
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storiesList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={64}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyText}>
              No offline stories available
            </Text>
            <Text style={styles.emptySubtext}>
              Download stories from your library to read them offline
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  storiesList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});