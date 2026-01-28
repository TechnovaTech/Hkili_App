import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentTab = segments[1] || 'home';
  
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="subscription" />
        <Tabs.Screen name="settings" />
      </Tabs>
      
      <View style={styles.bottomNavbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/home')}>
          <Ionicons name="home" size={24} color={currentTab === 'home' ? '#FF6B35' : '#B8A9C9'} />
          <Text style={[styles.navText, currentTab === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/library')}>
          <Ionicons name="book-outline" size={24} color={currentTab === 'library' ? '#FF6B35' : '#B8A9C9'} />
          <Text style={[styles.navText, currentTab === 'library' && styles.activeNavText]}>My Story</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/subscription')}>
          <Ionicons name="card-outline" size={24} color={currentTab === 'subscription' ? '#FF6B35' : '#B8A9C9'} />
          <Text style={[styles.navText, currentTab === 'subscription' && styles.activeNavText]}>Subscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="settings-outline" size={24} color={currentTab === 'settings' ? '#FF6B35' : '#B8A9C9'} />
          <Text style={[styles.navText, currentTab === 'settings' && styles.activeNavText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomNavbar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: '#B8A9C9',
  },
  activeNavText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});