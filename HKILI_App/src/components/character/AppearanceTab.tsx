import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CharacterFormData } from '@/types/character';
import AvatarBuilder from './AvatarBuilder';

interface AppearanceTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const handleAvatarChange = (newConfig: Record<string, any>) => {
    updateFormData({ avatarConfig: newConfig });
  };

  return (
    <View style={styles.container}>
      <AvatarBuilder 
        config={formData.avatarConfig || {}} 
        onChange={handleAvatarChange} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
