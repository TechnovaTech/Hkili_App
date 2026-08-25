import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

type GradientName = 'primary' | 'secondary' | 'gold' | 'aurora' | 'magic' | 'sunset';

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
    gradient === 'gold'
      ? theme.shadows.glowGold
      : gradient === 'secondary'
      ? theme.shadows.glowBlue
      : gradient === 'magic' || gradient === 'sunset'
      ? theme.shadows.glowTeal
      : theme.shadows.glow;

  // Subtle press-scale micro-interaction for a more tactile, premium feel.
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  // Slow specular sweep across the fill so the CTA reads as polished glass.
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (disabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Pause between sweeps so it feels like a highlight, not a barber pole.
        Animated.delay(2400),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, disabled]);

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
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              {
                opacity: shimmer.interpolate({
                  inputRange: [0, 0.15, 0.85, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: shimmer.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-260, 260],
                    }),
                  },
                  { rotate: '18deg' },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={theme.gradients.sheen}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
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
  shimmer: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 70,
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
