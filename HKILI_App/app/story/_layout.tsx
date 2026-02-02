import React from 'react';
import { Stack } from 'expo-router';

export default function StoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f0f0f' },
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
