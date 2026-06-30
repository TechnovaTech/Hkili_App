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
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { categoryService, Category } from '@/services/categoryService';
import { playClickSound } from '@/utils/soundUtils';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen() {
  const params = useLocalSearchParams();
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

  const handleModeSelect = async (modeId: string) => {
    await playClickSound();
    router.push({
      pathname: '/story/story-place-selection',
      params: { 
        ...params,
        categoryId: modeId 
      }
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
            <LinearGradient
              colors={theme.gradients.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}
            >
               <Ionicons name="image-outline" size={40} color={theme.colors.text} />
            </LinearGradient>
          )}
        </TouchableOpacity>
        <Text style={styles.modeTitle}>{mode.name}</Text>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a mode</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.modesGrid}>
              {categories.map(renderModeCard)}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
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
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
});