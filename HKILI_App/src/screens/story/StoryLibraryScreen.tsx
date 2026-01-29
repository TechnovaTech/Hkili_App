import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const mockStories = [
  {
    id: '1',
    title: 'The Brave Little Dragon',
    genre: 'Adventure',
    childName: 'Alex',
    childAge: 6,
    createdAt: '2024-01-20',
    emoji: '🐉',
  },
  {
    id: '2',
    title: 'Magic Forest Friends',
    genre: 'Fantasy',
    childName: 'Emma',
    childAge: 5,
    createdAt: '2024-01-19',
    emoji: '🧚♀️',
  },
  {
    id: '3',
    title: 'The Counting Adventure',
    genre: 'Educational',
    childName: 'Sam',
    childAge: 4,
    createdAt: '2024-01-18',
    emoji: '🔢',
  },
];

export default function StoryLibraryScreen() {
  const router = useRouter();

  const renderStoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`/story/viewer` as any)}
    >
      <View style={styles.storyImage}>
        <Text style={styles.storyEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle}>{item.title}</Text>
        <Text style={styles.storyGenre}>{item.genre}</Text>
        <Text style={styles.storyInfo}>
          {item.childName}, {item.childAge} years old
        </Text>
        <Text style={styles.storyDate}>{item.createdAt}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>My Stories</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>2</Text>
          <Ionicons name="layers-outline" size={20} color="#4CAF50" />
        </View>
      </View>

      <FlatList
        data={mockStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storiesList}
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#4CAF50',
    fontWeight: '600',
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storyGenre: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  storyInfo: {
    fontSize: 12,
    color: '#81C784',
    marginBottom: 2,
  },
  storyDate: {
    fontSize: 12,
    color: '#64B5F6',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});