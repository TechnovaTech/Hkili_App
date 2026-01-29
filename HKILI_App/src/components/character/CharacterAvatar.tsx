import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import * as AvataaarsModule from '@dicebear/avataaars';

interface CharacterAvatarProps {
  config?: Record<string, any>;
  size?: number;
  style?: ViewStyle;
  seed?: string;
}

export default function CharacterAvatar({ config, size = 100, style, seed }: CharacterAvatarProps) {
  const resolvedStyle = (AvataaarsModule as any).avataaars ?? (AvataaarsModule as any).default ?? AvataaarsModule;
  const avatarSvg = useMemo(() => {
    if (!resolvedStyle || !(resolvedStyle as any).schema) {
      return getFallbackSvg(size);
    }
    const options: any = {
      size: size,
      ...config,
    };
    
    if (!config && seed) {
      options.seed = seed;
    }

    if (!config && !seed) {
      options.seed = 'default';
    }

    return createAvatar(resolvedStyle, options).toString();
  }, [config, size, seed, resolvedStyle]);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <SvgXml xml={avatarSvg} width={size} height={size} />
    </View>
  );
}

const getFallbackSvg = (size: number) => {
  const safeSize = Math.max(10, size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#E6E6E6"/><circle cx="35" cy="45" r="6" fill="#8B8B8B"/><circle cx="65" cy="45" r="6" fill="#8B8B8B"/><path d="M30 70 Q50 80 70 70" stroke="#8B8B8B" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
};
