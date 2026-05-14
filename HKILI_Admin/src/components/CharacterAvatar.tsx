import React from 'react';

interface CharacterAvatarProps {
  skinColor?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  avatarUrl?: string;
  gender?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CharacterAvatar({ 
  skinColor = '#FDBCB4', 
  hairColor = '#8B4513', 
  hairStyle = 'Short', 
  eyeColor = '#8B4513',
  avatarUrl,
  gender,
  name,
  size = 'md'
}: CharacterAvatarProps) {
  
  const getAvatarSource = () => {
    if (avatarUrl) {
      if (avatarUrl.startsWith('http')) return avatarUrl;
      // It's a path like 'male/image.jpg' or an ID
      if (avatarUrl.startsWith('male/') || avatarUrl.startsWith('female/')) {
        return `/${avatarUrl}`;
      }
      // Handle IDs if needed, but for now assuming it's a path or URL
      return `/${avatarUrl}`;
    }

    // Fallback logic if no avatarUrl
    const maleAvatars = [
      'male/3d-boy-avatar-cartoon-boy-character-with-smiling-face-Tb7CAEg3_t.jpg',
      'male/3d-boy-avatar-cute-cartoon-boy-with-glasses-design-PmX0ik1h_t.jpg',
      'male/hand-drawn-profile-icon-avatar-character_884500-33561.avif',
      'male/hand-drawn-profile-icon-avatar-character_884500-34499.avif',
      'male/hand-drawn-profile-icon-avatar-character_884500-34686.jpg',
      'male/hand-drawn-profile-icon-avatar-character_884500-34726.avif',
      'male/images.jpg'
    ];

    const femaleAvatars = [
      '360_F_643686558_Efl6HB1ITw98bx1PdAd1wy56QpUTMh47.jpg',
      '3d-girl-avatar-3d-animated-girl-in-orange-sweater-TFsMwdNz_t.jpg',
      '3d-girl-avatar-animated-girl-character-with-glasses-B1jLa3Xa_t.jpg',
      '3d-woman-avatar-3d-cartoon-girl-with-brown-hair-M7DPxRTU_t.jpg',
      'cute-cartoon-girl-avatar-long-brown-hair-friendly-expression-various-uses-showcasing-young-female-character-371428712.webp',
      'cute-girl-avatar-featuring-long-black-hair-styled-flat-design-smiling-wearing-shirt-embodying-youthful-371432328.webp',
      'generated-image-372601986.webp',
      'young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.avif'
    ].map(p => `female/${p}`);

    const avatars = gender === 'female' ? femaleAvatars : maleAvatars;
    
    if (name) {
      const index = name.length % avatars.length;
      return `/${avatars[index]}`;
    }
    
    return `/${avatars[0]}`;
  };

  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`${dimensions[size]} rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm`}>
      <img 
        src={getAvatarSource()} 
        alt={name || 'Character'} 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
          />
          <div 
            className="absolute z-20"
            style={{
              left: '4px',
              top: '20px',
              width: '8px',
              height: '15px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '5px',
              borderBottomLeftRadius: '5px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '4px',
              top: '20px',
              width: '8px',
              height: '15px',
              backgroundColor: hairColor,
              borderTopRightRadius: '5px',
              borderBottomRightRadius: '5px'
            }}
          />
        </>
      );
    }

    if (hairStyle === 'Straight') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-0"
            style={{
              top: '21px',
              left: '5px',
              right: '5px',
              height: '28px',
              backgroundColor: hairColor,
              borderBottomLeftRadius: '13px',
              borderBottomRightRadius: '13px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              left: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px'
            }}
          />
        </>
      );
    }

    if (hairStyle === 'Braided') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '9px',
              top: '23px',
              width: '7px',
              height: '23px',
              backgroundColor: hairColor,
              borderRadius: '3.5px'
            }}
          />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[25px]" style={{ backgroundColor: hairColor }} />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[31px]" style={{ backgroundColor: hairColor }} />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[37px]" style={{ backgroundColor: hairColor }} />
        </>
      );
    }

    // Default Short
    return (
      <>
        <div 
          className="absolute z-10"
          style={{
            top: '-3px',
            left: '5px',
            right: '5px',
            height: '27.5px',
            backgroundColor: hairColor,
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px'
          }}
        />
        <div 
          className="absolute z-10"
          style={{
            top: '16px',
            left: '12px',
            width: '18px',
            height: '7px',
            backgroundColor: hairColor,
            borderRadius: '4px'
          }}
        />
      </>
    );
  };

  return (
    <div className="relative w-[80px] h-[80px] rounded-full flex justify-center items-center shadow-md bg-[rgba(255,255,255,0.12)]"
         style={{ boxShadow: '0 3px 5px rgba(0,0,0,0.25)' }}>
      <div 
        className="relative w-[60px] h-[60px] rounded-full flex flex-col justify-center items-center"
        style={{ backgroundColor: skinColor }}
      >
        {renderHair()}
        <div className="flex gap-2 z-20 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eyeColor }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eyeColor }} />
        </div>
        <div className="w-[14px] h-[2px] rounded-[1px] bg-[rgba(0,0,0,0.2)] mt-[5px] z-20" />
      </div>
    </div>
  );
}
