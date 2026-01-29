import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { CharacterFormData } from '@/types/character';

interface AvatarRenderProps {
  formData: CharacterFormData;
  size?: number;
}

export const getDiceBearUrl = (formData: CharacterFormData, previewOptions?: {
  focusedPart?: string; // 'top', 'eyes', etc.
  focusedValue?: string; // The value to preview
  lean?: boolean; // Optimization: Exclude unrelated attributes for grid previews
}) => {
  const seed = formData.name || 'default';
  const baseUrl = 'https://api.dicebear.com/9.x/avataaars/png';
  
  // Helper to remove '#' from hex colors
  const formatColor = (color: string) => color.replace('#', '');

  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: 'b6e3f4',
    radius: '50',
  });

  // Default values
  let hairStyle = formData.hairStyle;
  let hairColor = formData.hairColor;
  let skinColor = formData.skinColor;
  let facialHair = formData.facialHair;
  let glasses = formData.glasses;
  let mouth = formData.mouth;
  let eyebrows = formData.eyebrows;
  let clothing = formData.clothing;
  let clothingColor = formData.clothingColor;

  // LEAN MODE: Reset unrelated attributes to defaults to maximize caching and performance
  // This ensures that changing your shirt doesn't force all 20 hair style previews to reload
  if (previewOptions?.lean) {
    const { focusedPart } = previewOptions;

    // Optimization: Request smaller images for grid previews to speed up loading
    params.append('size', '150');

    // Default "Clean" State
    facialHair = 'none';
    glasses = 'none';
    mouth = 'default';
    eyebrows = 'default';
    clothing = 'collarAndSweater'; // neutral default
    clothingColor = '262E33'; // neutral default
    
    // We ALWAYS keep skinColor as it's fundamental
    skinColor = formData.skinColor;

    // Context-aware preservation
    if (focusedPart === 'hairStyle') {
      // Hair grid needs: Hair Color
      hairColor = formData.hairColor;
      // Reset hair style (will be overridden by focusedValue later)
    } 
    else if (focusedPart === 'facialHair') {
      // Beard grid needs: Hair Color (usually matches), Hair Style (for context)
      hairColor = formData.hairColor;
      hairStyle = formData.hairStyle;
    }
    else if (focusedPart === 'glasses') {
      // Glasses grid needs: Hair Style (context)
      hairStyle = formData.hairStyle;
      // Maybe hair color too
      hairColor = formData.hairColor;
    }
    else if (focusedPart === 'mouth' || focusedPart === 'eyebrows') {
      // Face features need: Hair Style (context)
      hairStyle = formData.hairStyle;
      hairColor = formData.hairColor;
    }
    else if (focusedPart === 'clothing') {
      // Clothing grid needs: Clothing Color
      clothingColor = formData.clothingColor;
      // Keep head context
      hairStyle = formData.hairStyle;
      hairColor = formData.hairColor;
    }
  }

  // Override for previews
  if (previewOptions) {
    const { focusedPart, focusedValue } = previewOptions;
    if (focusedPart === 'hairStyle') hairStyle = focusedValue!;
    if (focusedPart === 'facialHair') facialHair = focusedValue!;
    if (focusedPart === 'glasses') glasses = focusedValue!;
    if (focusedPart === 'mouth') mouth = focusedValue!;
    if (focusedPart === 'eyebrows') eyebrows = focusedValue!;
    if (focusedPart === 'clothing') clothing = focusedValue!;
    
    // Zoom/Crop for specific parts if needed
    if (focusedPart === 'eyes' || focusedPart === 'eyebrows' || focusedPart === 'glasses') {
       // params.append('scale', '150'); // Optional zoom
    }
  }

  // --- Parameter Appending ---

  // Hair Style (top)
  if (hairStyle) {
    const isLikelyApiKey = /^[a-z]/.test(hairStyle);
    if (isLikelyApiKey) {
      params.append('top', hairStyle);
    }
  }

  // Hair Color
  if (hairColor) {
    params.append('hairColor', formatColor(hairColor));
  }

  // Skin Color
  if (skinColor) {
    params.append('skinColor', formatColor(skinColor));
  }
  
  // Facial Hair
  if (facialHair && facialHair !== 'none') {
    params.append('facialHair', facialHair);
    if (hairColor) {
      params.append('facialHairColor', formatColor(hairColor));
    }
  } else {
    params.append('facialHairProbability', '0');
  }

  // Glasses (accessories)
  if (glasses && glasses !== 'none') {
    params.append('accessories', glasses);
    params.append('accessoriesProbability', '100');
  } else {
    params.append('accessoriesProbability', '0');
  }

  // Mouth
  if (mouth) {
    params.append('mouth', mouth);
  }

  // Eyebrows
  if (eyebrows) {
    params.append('eyebrows', eyebrows);
  }

  // Clothing
  if (clothing) {
    params.append('clothing', clothing);
  }
  
  if (clothingColor) {
    params.append('clothingColor', formatColor(clothingColor));
  }

  return `${baseUrl}?${params.toString()}`;
};

export const AvatarPreview: React.FC<AvatarRenderProps> = ({ formData, size = 200 }) => {
  const [loading, setLoading] = React.useState(true);
  const uri = getDiceBearUrl(formData);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        resizeMode="contain"
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
