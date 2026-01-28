import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="language-outline" size={24} color="#4CAF50" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingSubtitle}>English</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#81C784" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="text-outline" size={24} color="#4CAF50" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Text Size</Text>
            <Text style={styles.settingSubtitle}>Medium</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#81C784" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#81C784" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#81C784',
  },
});