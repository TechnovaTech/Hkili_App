import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Story } from '@/types';
import { useTranslation } from 'react-i18next';

interface StoryCardProps {
  story: Story;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDownload?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onPress,
  onToggleFavorite,
  onDownload,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    return `${minutes} min`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {story.imageUrl ? (
          <Image source={{ uri: story.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="book"
              size={32}
              color={theme.colors.textMuted}
            />
          </View>
        )}
        
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
          >
            <Ionicons
              name={story.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={story.isFavorite ? theme.colors.error : theme.colors.text}
            />
          </TouchableOpacity>
          
          {onDownload && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={onDownload}
            >
              <Ionicons
                name={story.isDownloaded ? 'checkmark-circle' : 'download-outline'}
                size={20}
                color={story.isDownloaded ? theme.colors.success : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        
        <View style={styles.metadata}>
          <Text style={styles.genre}>
            {t(`genres.${story.genre}`)}
          </Text>
          {story.duration && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.duration}>
                {formatDuration(story.duration)}
              </Text>
            </>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.childInfo}>
            {story.childName}, {story.childAge} years
          </Text>
          <Text style={styles.date}>
            {formatDate(story.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
  },
  favoriteButton: {
    backgroundColor: theme.colors.overlay,
    borderRadius: 20,
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  downloadButton: {
    backgroundColor: theme.colors.overlay,
    borderRadius: 20,
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  genre: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  separator: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.sm,
  },
  duration: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  date: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});