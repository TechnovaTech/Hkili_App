import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { storyService } from '@/services/storyService';
import { Story } from '@/types';

export default function StoryGenerationScreen() {
  const { mode, character, place, moral } = useLocalSearchParams<{ 
    mode: string; 
    character: string; 
    place: string;
    moral: string;
  }>();
  
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
  const [scaleAnim] = useState(new Animated.Value(1));
  const [matchingStories, setMatchingStories] = useState<Story[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  useEffect(() => {
    // Start fetching immediately in background
    if (mode && character && !hasFetched) {
      fetchMatchingStories();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGenerationComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const animate = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Effect to handle navigation when timer hits 0
  useEffect(() => {
    if (generationComplete) {
      handleStorySelection();
    }
  }, [generationComplete, matchingStories]);

  const fetchMatchingStories = async () => {
    try {
      console.log(`Generating story for category=${mode}, character=${character}, place=${place}, moral=${moral}`);
      // Use generateStory to create a new story on the fly
      const response = await storyService.generateStory({
        categoryId: mode,
        storyCharacterId: character,
        place,
        moral,
        language: 'EN' // Default to EN or get from settings if available
      });
      
      if (response.success && response.data) {
        console.log(`Story generated successfully: ${response.data.title}`);
        setMatchingStories([response.data]);
      } else {
        console.log('Story generation failed:', response.error);
        if (response.error === 'Insufficient coins to generate story') {
           // Ideally show an alert here, but for now we log it
           console.warn('User has insufficient coins');
        }
      }
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setHasFetched(true);
    }
  };

  const handleStorySelection = () => {
    if (matchingStories.length > 0) {
      // Pick a random story
      const randomIndex = Math.floor(Math.random() * matchingStories.length);
      const selectedStory = matchingStories[randomIndex];
      const storyId = selectedStory._id || selectedStory.id;
      
      console.log(`Navigating to story: ${storyId}`);
      
      // Save to library before navigating (fire and forget)
      storyService.addToLibrary(storyId).catch(err => console.error('Failed to save to library:', err));

      // Navigate to viewer
      router.replace({
        pathname: '/story/viewer',
        params: { storyId } 
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackPress = () => {
    router.push('/(tabs)/home');
  };

  // If time is up and no stories found
  if (generationComplete && matchingStories.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Story Generation</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF9800" />
          <Text style={styles.errorTitle}>No Story Found</Text>
          <Text style={styles.errorText}>
            We couldn't find a story matching your exact selection.
            Please try selecting a different character or check back later!
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
            <Text style={styles.retryButtonText}>Go Back Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story is generating...</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Generating the story can take up to 2 minutes. Please be patient.
        </Text>

        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

        <View style={styles.imageContainer}>
          <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.storyImagePlaceholder}>
              <Text style={styles.storyEmoji}>📚</Text>
            </View>
          </Animated.View>
        </View>

        <Text style={styles.bottomText}>
          One moment please, I'm generating your story...
        </Text>
        
        {/* Debug Info (Optional - hidden in production) */}
        {/* <Text style={{color: 'gray', marginTop: 10}}>
           Status: {hasFetched ? (matchingStories.length > 0 ? 'Ready' : 'No Stories') : 'Fetching...'}
        </Text> */}
      </View>

      <TouchableOpacity 
        style={styles.notifyButton}
        onPress={() => {}}
      >
        <Text style={styles.notifyButtonText}>Get notified</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  description: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  animatedContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  storyImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyEmoji: {
    fontSize: 60,
  },
  bottomText: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 20,
  },
  notifyButton: {
    margin: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  errorText: {
    color: '#B0B0B0',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  retryButton: {
    marginTop: 30,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
