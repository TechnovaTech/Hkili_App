import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { categoryService, Category } from '@/services/categoryService';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (modeId: string) => {
    router.push({
      pathname: '/story/mode-character-selection',
      params: { mode: modeId }
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return { uri: imagePath };
    
    // API URL usually includes /api (e.g. http://localhost:3001/api)
    // But static files are served from root (e.g. http://localhost:3001/uploads/...)
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    let baseUrl = apiUrl;
    
    try {
      const url = new URL(apiUrl);
      baseUrl = url.origin;
    } catch (e) {
      // Fallback: strip /api from end if present
      baseUrl = apiUrl.replace(/\/api\/?$/, '');
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return { uri: `${baseUrl}/${cleanPath}` };
  };

  const renderModeCard = (mode: Category, index: number) => {
    const cardWidth = (width - 60) / 2;
    const isTopRow = index < 2;
    const imageSource = getImageUrl(mode.image);
    
    return (
      <View key={mode._id} style={styles.modeContainer}>
        {/* Only show subtitle if it was part of the original design, but for dynamic categories we might not have it.
            The original code had 'subtitle' only for some items. We can use description or omit it. 
            The user said "same ui". */}
        <TouchableOpacity
          style={[styles.modeCard, { width: cardWidth }]}
          onPress={() => handleModeSelect(mode._id)}
          activeOpacity={0.8}
        >
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#2A3B4D', justifyContent: 'center', alignItems: 'center' }]}>
               <Ionicons name="image-outline" size={40} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.modeTitle}>{mode.name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a mode</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.modesGrid}>
            {categories.map(renderModeCard)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeContainer: {
    width: (width - 60) / 2,
    marginBottom: 30,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modeCard: {
    height: 140,
    borderRadius: 25,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
});