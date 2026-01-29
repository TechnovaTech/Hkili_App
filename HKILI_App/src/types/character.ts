export interface Character {
  id: string;
  name: string;
  age?: number;
  gender: 'male' | 'female' | 'n/a';
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  hairStyle: string;
  faceShape: string;
  facialHair?: string;
  glasses?: string;
  mouth?: string;
  eyebrows?: string;
  clothing?: string;
  clothingColor?: string;
  interests: string[];
  isMainCharacter: boolean;
  avatarUrl?: string;
}

export interface CharacterFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'n/a';
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  hairStyle: string;
  faceShape: string;
  facialHair?: string;
  glasses?: string;
  mouth?: string;
  eyebrows?: string;
  clothing?: string;
  clothingColor?: string;
  interests: string[];
  customInterests: string[];
  avatarId?: number;
}

export const HAIR_COLORS = [
  '#FFFFFF', '#C0C0C0', '#D2B48C', '#FFD700',
  '#FF69B4', '#8A2BE2', '#0000FF', '#00FF00',
  '#B22222', '#FF4500', '#8B0000', '#8B4513',
  '#654321', '#000000'
];

export const EYE_COLORS = [
  '#8B4513', '#D2691E', '#4682B4', '#228B22',
  '#DEB887', '#F4A460', '#808080'
];

export const PREDEFINED_INTERESTS = [
  'Sports', 'Music', 'Art', 'Reading', 'Science',
  'Animals', 'Nature', 'Cooking', 'Dancing',
  'Space', 'Video Games', 'Superheroes', 'Princesses',
  'Cars', 'Magic'
];