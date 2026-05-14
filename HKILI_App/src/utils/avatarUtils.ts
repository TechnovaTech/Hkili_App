export const MALE_AVATARS = [
  { id: 'm1', gender: 'male', image: require('../../assets/images/male/3d-boy-avatar-cartoon-boy-character-with-smiling-face-Tb7CAEg3_t.jpg') },
  { id: 'm2', gender: 'male', image: require('../../assets/images/male/3d-boy-avatar-cute-cartoon-boy-with-glasses-design-PmX0ik1h_t.jpg') },
  { id: 'm3', gender: 'male', image: require('../../assets/images/male/hand-drawn-profile-icon-avatar-character_884500-33561.avif') },
  { id: 'm4', gender: 'male', image: require('../../assets/images/male/hand-drawn-profile-icon-avatar-character_884500-34499.avif') },
  { id: 'm5', gender: 'male', image: require('../../assets/images/male/hand-drawn-profile-icon-avatar-character_884500-34686.jpg') },
  { id: 'm6', gender: 'male', image: require('../../assets/images/male/hand-drawn-profile-icon-avatar-character_884500-34726.avif') },
  { id: 'm7', gender: 'male', image: require('../../assets/images/male/images.jpg') },
];

export const FEMALE_AVATARS = [
  { id: 'f1', gender: 'female', image: require('../../assets/images/female/360_F_643686558_Efl6HB1ITw98bx1PdAd1wy56QpUTMh47.jpg') },
  { id: 'f2', gender: 'female', image: require('../../assets/images/female/3d-girl-avatar-3d-animated-girl-in-orange-sweater-TFsMwdNz_t.jpg') },
  { id: 'f3', gender: 'female', image: require('../../assets/images/female/3d-girl-avatar-animated-girl-character-with-glasses-B1jLa3Xa_t.jpg') },
  { id: 'f4', gender: 'female', image: require('../../assets/images/female/3d-woman-avatar-3d-cartoon-girl-with-brown-hair-M7DPxRTU_t.jpg') },
  { id: 'f5', gender: 'female', image: require('../../assets/images/female/cute-cartoon-girl-avatar-long-brown-hair-friendly-expression-various-uses-showcasing-young-female-character-371428712.webp') },
  { id: 'f6', gender: 'female', image: require('../../assets/images/female/cute-girl-avatar-featuring-long-black-hair-styled-flat-design-smiling-wearing-shirt-embodying-youthful-371432328.webp') },
  { id: 'f7', gender: 'female', image: require('../../assets/images/female/generated-image-372601986.webp') },
  { id: 'f8', gender: 'female', image: require('../../assets/images/female/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.avif') },
];

export const ALL_AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS];

export const getAvatarSource = (avatarUrl: string | number) => {
  if (!avatarUrl) return null;
  if (typeof avatarUrl === 'number') return avatarUrl;
  if (avatarUrl.startsWith('http')) return { uri: avatarUrl };
  
  // Check if it's one of our local avatars by ID
  const localAvatar = ALL_AVATARS.find(av => av.id === avatarUrl);
  if (localAvatar) return localAvatar.image;
  
  return { uri: avatarUrl };
};
