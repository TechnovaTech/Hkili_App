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
      <Stack.Screen name="viewer" />
      <Stack.Screen name="generate" />
      <Stack.Screen name="library" />
      <Stack.Screen name="offline" />
      <Stack.Screen name="character-selection" />
      <Stack.Screen 
        name="story-generation" 
        options={{
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}