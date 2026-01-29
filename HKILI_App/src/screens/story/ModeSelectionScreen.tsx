import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/theme';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen() {
  const storyModes = [
    {
      id: 'vegetable',
      title: 'Vegetable',
      image: require('../../../assets/i1.jpg'),
    },
    {
      id: 'environment',
      title: 'Environment',
      image: require('../../../assets/i2.jpg'),
    },
    {
      id: 'jungle-book',
      title: 'Jungle Book',
      image: require('../../../assets/i3.jpg'),
    },
    {
      id: 'alice-wonderland',
      title: 'Alice in Wonderland',
      image: require('../../../assets/i1.jpg'),
    },
    {
      id: 'grimms-tales',
      title: "Grimm's Tales",
      image: require('../../../assets/i2.jpg'),
    },
    {
      id: 'wizard-oz',
      title: 'Wizard of Oz',
      image: require('../../../assets/i3.jpg'),
    },
  ];

  const handleModeSelect = (modeId: string) => {
    router.push({
      pathname: '/story/mode-character-selection',
      params: { mode: modeId }
    });
  };

  const renderModeCard = (mode: any, index: number) => {
    const cardWidth = (width - 60) / 2;
    const isTopRow = index < 2;
    
    return (
      <View key={mode.id} style={styles.modeContainer}>
        {isTopRow && mode.subtitle && (
          <Text style={styles.categoryTitle}>{mode.subtitle}</Text>
        )}
        <TouchableOpacity
          style={[styles.modeCard, { width: cardWidth }]}
          onPress={() => handleModeSelect(mode.id)}
          activeOpacity={0.8}
        >
          <Image 
            source={mode.image} 
            style={styles.cardImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <Text style={styles.modeTitle}>{mode.title}</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.modesGrid}>
          {storyModes.map(renderModeCard)}
        </View>
      </ScrollView>
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