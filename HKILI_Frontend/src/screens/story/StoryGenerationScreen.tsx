import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function StoryGenerationScreen() {
  const { mode, character, place, moral } = useLocalSearchParams<{ 
    mode: string; 
    character: string; 
    place: string;
    moral: string;
  }>();
  
  const [timeLeft, setTimeLeft] = useState(120);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGetNotified = () => {
    console.log('Get notified clicked');
  };

  const handleBackPress = () => {
    router.push('/(tabs)/home');
  };

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
      </View>

      <TouchableOpacity 
        style={styles.notifyButton}
        onPress={handleGetNotified}
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
    justifyContent: 'space-around',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  animatedContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  storyImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyEmoji: {
    fontSize: 80,
  },
  bottomText: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  notifyButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  notifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});