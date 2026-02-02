import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/theme';

export default function StoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="mode-selection" />
      <Stack.Screen name="mode-character-selection" />
      <Stack.Screen name="story-place-selection" />
      <Stack.Screen name="moral-selection" />
      <Stack.Screen 
        name="story-generation" 
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen name="viewer" />
      <Stack.Screen name="offline" />
    </Stack>
  );
}
