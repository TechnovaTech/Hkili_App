# Story Generation Flow - Implementation Summary

## Overview
The app now uses a streamlined flow where users select main/side characters, then category, then place + moral, and the app generates a story using OpenAI with a structured prompt.

## Changes Made

### 1. Database Model (Story.ts)
**File:** `HKILI_Admin/src/models/Story.ts`
- Added fields: `place`, `moral`, `mainCharacters`, `sideCharacters`, `prompt`
- These fields store metadata about AI-generated stories

### 2. Backend API - AI Generate Route
**File:** `HKILI_Admin/src/app/api/ai/generate/route.ts`
- **Completely rewritten** to accept structured params from the app:
  - `categoryId`, `mainCharacterIds`, `sideCharacterIds`, `place`, `moral`
- Builds a structured prompt:
  ```
  Write a [CATEGORY] story set in [PLACE].
  
  Main character(s): [NAMES]
  Side character(s): [NAMES]
  Moral of the story: [MORAL]
  
  Make the story immersive, coherent, and end with the moral clearly reflected in the outcome.
  ```
- Calls OpenAI API with this prompt
- Saves the story with all metadata including the prompt
- Deducts coins (unless admin)
- Returns the generated story

### 3. App Flow Changes

#### HomeScreen.tsx
**File:** `HKILI_App/src/screens/home/HomeScreen.tsx`
- Updated `handleStart()` to pass `mainCharacterIds` and `sideCharacterIds` (instead of old param names)
- Navigates to `/story/mode-selection` with character IDs

#### ModeSelectionScreen.tsx
**File:** `HKILI_App/src/screens/story/ModeSelectionScreen.tsx`
- Updated `handleModeSelect()` to navigate directly to `/story/story-place-selection`
- Skips the old story character selection screen
- Passes `categoryId` instead of `mode`

#### StoryPlaceSelectionScreen.tsx
**File:** `HKILI_App/src/screens/story/StoryPlaceSelectionScreen.tsx`
- **Completely rewritten** to combine place input + moral selection in one screen
- Shows a text input for place
- Shows a grid of moral options (inline, not a separate screen)
- Navigates to `/story/story-generation` with all params when user clicks "Generate Story"

#### StoryGenerationScreen.tsx
**File:** `HKILI_App/src/screens/story/StoryGenerationScreen.tsx`
- **Completely rewritten** to call `/api/ai/generate` instead of the old generate endpoint
- Sends: `categoryId`, `mainCharacterIds`, `sideCharacterIds`, `place`, `moral`, `language`
- Shows loading animation while OpenAI generates the story
- On success: saves to library and navigates to story viewer
- On error: shows error message

### 4. Admin Panel - Stories Management
**File:** `HKILI_Admin/src/app/admin/stories/page.tsx`
- Updated Story interface to include new fields
- Added display of:
  - **AI Prompt** (collapsible details section)
  - **Place** (with 📍 icon)
  - **Moral** (with 💡 icon)
  - **Main Characters** (with 👤 icon)
  - **Side Characters** (with 👥 icon)

### 5. API Client Timeout
**File:** `HKILI_App/src/services/apiClient.ts`
- Increased timeout from 30s to 120s to accommodate OpenAI generation time

## User Flow (New)

1. **Home Screen**: User selects main characters (required) and side characters (optional)
2. **Category Selection**: User picks a story category (e.g., Adventure, Fantasy)
3. **Place & Moral**: User enters a place and selects a moral in one screen
4. **Story Generation**: App calls OpenAI API with structured prompt, shows loading animation
5. **Story Viewer**: Generated story is displayed and saved to library

## Backend Prompt Structure

The prompt sent to OpenAI is structured as:
```
Write a [CATEGORY] story set in [PLACE].

Main character(s): [CHARACTER_NAMES]
Side character(s): [CHARACTER_NAMES or "None"]
Moral of the story: [MORAL or "No specific moral"]

Make the story immersive, coherent, and end with the moral clearly reflected in the outcome.
```

## Admin Panel Features

- Admins can view the exact prompt used to generate each story
- All story metadata (place, moral, characters) is visible
- The prompt is hidden by default in a collapsible section to keep the UI clean

## Notes

- The old flow (story character selection → moral selection) is now bypassed
- Users' own characters are used instead of predefined story characters
- The moral selection is now inline with place selection
- All prompts and metadata are stored for transparency and debugging
- The prompt is NOT shown to end users in the app, only in the admin panel
