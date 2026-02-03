import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio, Video, ResizeMode } from 'expo-av';
import { storyService } from '@/services/storyService';
import { Story } from '@/types';
import { theme } from '@/theme';

const { width } = Dimensions.get('window');

// Video Component with Custom Overlay
const StoryVideo = ({ source, onPlay }: { source: any, onPlay: () => void }) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      onPlay();
      await videoRef.current.playAsync();
    }
  };

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={source}
        useNativeControls={true} // Always enable native controls to ensure pause functionality works
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }}
      />
      {!isPlaying && (
        <TouchableOpacity style={styles.playOverlay} onPress={togglePlay}>
            <View style={styles.playCircleSmall}>
              <Ionicons name="play" size={32} color={theme.colors.primary} style={{ marginLeft: 4 }} />
            </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function StoryViewerScreen() {
  const router = useRouter();
  const { storyId, storyData } = useLocalSearchParams<{ storyId: string; storyData: string }>();
  const id = Array.isArray(storyId) ? storyId[0] : storyId;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (storyData) {
      // Use passed data if available (e.g. fallback story)
      try {
        const parsedStory = JSON.parse(storyData);
        setStory(parsedStory);
        if (parsedStory.audioUrl) {
          loadAudio(parsedStory.audioUrl);
        }
        setLoading(false);
      } catch (e) {
        console.error('Error parsing story data', e);
        if (id) fetchStory(id);
      }
    } else if (id) {
      fetchStory(id);
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id, storyData]);

  const fetchStory = async (sid: string) => {
    try {
      const response = await storyService.getStory(sid);
      if (response.success && response.data) {
        setStory(response.data);
        if (response.data.audioUrl) {
          loadAudio(response.data.audioUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return { uri: imagePath };
    
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    let baseUrl = apiUrl;
    
    try {
      const url = new URL(apiUrl);
      baseUrl = url.origin;
    } catch (e) {
      baseUrl = apiUrl.replace(/\/api\/?$/, '');
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return { uri: `${baseUrl}/${cleanPath}` };
  };

  const loadAudio = async (uri: string) => {
    try {
      const audioUri = getImageUrl(uri)?.uri;
      if (!audioUri) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        // Optional: reset to start
        // sound?.setPositionAsync(0);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (!sound) return;
    const newPos = Math.min(position + 10000, duration);
    await sound.setPositionAsync(newPos);
  };

  const skipBackward = async () => {
    if (!sound) return;
    const newPos = Math.max(position - 10000, 0);
    await sound.setPositionAsync(newPos);
  };

  const handleSeek = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageSource = getImageUrl(story.imageUrl || (story.content && story.content[0]?.image));
  
  // Calculate video sources
  const video1Source = story.video1 ? getImageUrl(story.video1) : null;
  const video2Source = story.video2 ? getImageUrl(story.video2) : null;
  const video3Source = story.video3 ? getImageUrl(story.video3) : null;

  // Pre-process content to ensure we have multiple segments if possible
  let contentSegments = story.content || [];
  
  // If single segment, try to split by paragraphs for better layout (video 2 placement)
  if (contentSegments.length === 1 && contentSegments[0].text) {
    const text = contentSegments[0].text;
    // Split by double newline (paragraphs) or single if just long text? 
    // Usually stories have double newlines.
    const paragraphs = text.split(/\n\s*\n/); 
    if (paragraphs.length > 1) {
      contentSegments = paragraphs.map((p: string, i: number) => ({ 
        id: `auto-${i}`, 
        text: p.trim() 
      })).filter((s: any) => s.text.length > 0);
    }
  }

  // Split content for middle video
  // const contentSegments = story.content || []; // Removed duplicate declaration
  const middleIndex = Math.ceil(contentSegments.length / 2);
  const firstHalf = contentSegments.slice(0, middleIndex);
  const secondHalf = contentSegments.slice(middleIndex);

  const handleVideoPlay = async () => {
    if (isPlaying && sound) {
      await sound.pauseAsync();
    }
  };

  const renderVideo = (source: { uri: string } | null, label: string) => {
    if (!source) return null;
    return <StoryVideo source={source} onPlay={handleVideoPlay} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Story</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="print-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Story Title */}
        <Text style={styles.storyTitle}>{story.title}</Text>

        {/* Video 1 (After Title) */}
        {renderVideo(video1Source, 'Video 1')}

        {/* Subtitle / Section Header */}
        <Text style={styles.sectionTitle}>The Story</Text>

        {/* Story Text - First Half */}
        <View style={styles.textWrapper}>
          {firstHalf.map((segment: any, index: number) => (
            <Text key={`first-${index}`} style={styles.storyText}>
              {segment.text}
            </Text>
          ))}
        </View>

        {/* Video 2 (Middle) */}
        {renderVideo(video2Source, 'Video 2')}

        {/* Story Text - Second Half */}
        <View style={styles.textWrapper}>
          {secondHalf.map((segment: any, index: number) => (
            <Text key={`second-${index}`} style={styles.storyText}>
              {segment.text}
            </Text>
          ))}
        </View>

        {/* Video 3 (Last) */}
        {renderVideo(video3Source, 'Video 3')}
        
        {/* Spacer for bottom player */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Player */}
      {story.audioUrl && (
        <View style={styles.playerContainer}>
          {/* Progress Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor={theme.colors.primary}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color={theme.colors.primary} />
              <Text style={styles.skipText}>10</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayback} style={styles.playButtonLarge}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" style={{ marginLeft: isPlaying ? 0 : 4 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
              <Text style={styles.skipText}>10</Text>
              <Ionicons name="play-skip-forward" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'left',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playCircleSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  pauseCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  textWrapper: {
    marginBottom: 20,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -2,
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
    marginTop: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
