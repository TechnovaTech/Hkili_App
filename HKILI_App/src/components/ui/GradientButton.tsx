import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

type GradientName = 'primary' | 'secondary' | 'gold';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: GradientName;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  flexDirection?: ViewStyle['flexDirection'];
}

/**
 * A glowing, gradient-filled call-to-action button.
 * Disabled state falls back to a muted glass surface.
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradient = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  flexDirection = 'row',
}) => {
  const sizeStyle = styles[size];
  const glow =
    gradient === 'gold' ? theme.shadows.glowGold : theme.shadows.glow;

  // Subtle press-scale micro-interaction for a more tactile, premium feel.
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const content = (
    <View style={[styles.content, { flexDirection }]}>
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'small' ? 16 : 20}
              color="#fff"
            />
          )}
          <Text style={[styles.text, styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (disabled) {
    return (
      <TouchableOpacity
        style={[styles.base, sizeStyle, styles.disabled, style]}
        onPress={onPress}
        disabled
        activeOpacity={0.9}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[!disabled && glow, style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.base}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.gradients[gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, sizeStyle]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 58,
  },
  disabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 17 },
});
