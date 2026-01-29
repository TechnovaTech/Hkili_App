import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const mockStory = {
  title: 'The Brave Little Dragon',
  content: [
    {
      text: 'Once upon a time, in a magical kingdom far away, there lived a little dragon named Spark. Unlike other dragons, Spark was small and couldn\'t breathe fire yet.',
      image: '🐲',
    },
    {
      text: 'One day, the kingdom was in trouble. A dark cloud covered the sun, and all the flowers began to wilt. The wise owl told everyone that only a brave heart could save the day.',
      image: '☁️',
    },
    {
      text: 'Spark knew he had to help, even though he was small. He flew up to the dark cloud and discovered it was just a lonely storm cloud that needed a friend.',
      image: '⛈️',
    },
    {
      text: 'With kindness and friendship, Spark helped the cloud find its way home to the sky. The sun shone bright again, and Spark learned that being brave means being kind.',
      image: '☀️',
    },
  ],
};

export default function StoryViewerScreen() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = React.useState(0);

  const nextPage = () => {
    if (currentPage < mockStory.content.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentSegment = mockStory.content[currentPage];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>{mockStory.title}</Text>
        <TouchableOpacity style={styles.audioButton}>
          <Ionicons name="volume-high" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.storyImage}>{currentSegment.image}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.storyText}>{currentSegment.text}</Text>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
          onPress={prevPage}
          disabled={currentPage === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? '#8A7CA8' : '#FFFFFF'} />
          <Text style={[styles.navButtonText, currentPage === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentPage + 1} of {mockStory.content.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === mockStory.content.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={nextPage}
          disabled={currentPage === mockStory.content.length - 1}
        >
          <Text
            style={[
              styles.navButtonText,
              currentPage === mockStory.content.length - 1 && styles.navButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons name="chevron-forward" size={20} color={currentPage === mockStory.content.length - 1 ? '#8A7CA8' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  audioButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  storyImage: {
    fontSize: 100,
  },
  textContainer: {
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#8A7CA8',
  },
  pageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageText: {
    color: '#B8A9C9',
    fontSize: 14,
    fontWeight: '500',
  },
});