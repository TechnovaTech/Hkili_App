import React, { useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  ViewStyle,
  View,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Adds soft decorative aurora blobs + starfield behind the content. */
  decorated?: boolean;
  /** Disable motion (useful for dense/scroll-heavy screens or reduced motion). */
  animated?: boolean;
}

/** Deterministic PRNG so the starfield never reshuffles between renders. */
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

const STAR_COUNT = 42;

/**
 * Full-screen night-sky backdrop: layered gradient, three slowly
 * drifting green/blue glow blobs, and a twinkling starfield.
 *
 * Every animation uses the native driver (transform/opacity only) so the
 * motion stays smooth on low-end Android without blocking the JS thread.
 */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  style,
  decorated = true,
  animated = true,
}) => {
  const { width, height } = useWindowDimensions();

  // One shared 0->1 driver for the slow aurora drift.
  const drift = useRef(new Animated.Value(0)).current;
  // A second, slower driver so blobs don't move in lockstep.
  const drift2 = useRef(new Animated.Value(0)).current;
  // Twinkle driver for the starfield.
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!decorated || !animated) return;

    const loop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const a = loop(drift, 9000);
    const b = loop(drift2, 13000);
    const c = loop(twinkle, 2600);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [decorated, animated, drift, drift2, twinkle]);

  const stars = useMemo(() => {
    const rand = seeded(20260817);
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      key: `star-${i}`,
      left: rand() * width,
      top: rand() * height,
      size: 1 + rand() * 2.4,
      // Split stars into two twinkle phases so they don't all blink together.
      phase: i % 2,
      baseOpacity: 0.25 + rand() * 0.5,
    }));
  }, [width, height]);

  const blobA = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-width * 0.06, width * 0.1],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, height * 0.05],
        }),
      },
      { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
    ],
  };

  const blobB = {
    transform: [
      {
        translateX: drift2.interpolate({
          inputRange: [0, 1],
          outputRange: [width * 0.08, -width * 0.08],
        }),
      },
      {
        translateY: drift2.interpolate({
          inputRange: [0, 1],
          outputRange: [height * 0.03, -height * 0.04],
        }),
      },
      { scale: drift2.interpolate({ inputRange: [0, 1], outputRange: [1.12, 0.95] }) },
    ],
  };

  const blobC = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [width * 0.12, -width * 0.05],
        }),
      },
      { scale: drift2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) },
    ],
  };

  return (
    <LinearGradient
      colors={theme.gradients.background}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.fill, style]}
    >
      {decorated && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {/* Starfield sits furthest back. */}
          {stars.map((s) => (
            <Animated.View
              key={s.key}
              style={[
                styles.star,
                {
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  borderRadius: s.size,
                  opacity: animated
                    ? twinkle.interpolate({
                        inputRange: [0, 1],
                        outputRange:
                          s.phase === 0
                            ? [s.baseOpacity, s.baseOpacity * 0.25]
                            : [s.baseOpacity * 0.25, s.baseOpacity],
                      })
                    : s.baseOpacity,
                },
              ]}
            />
          ))}

          {/* Glow blobs — green top-left, blue bottom-right, teal centre. */}
          <Animated.View
            style={[
              styles.blob,
              {
                backgroundColor: 'rgba(0, 230, 118, 0.22)',
                width: width * 1.0,
                height: width * 1.0,
                top: -width * 0.5,
                left: -width * 0.35,
              },
              blobA,
            ]}
          />
          <Animated.View
            style={[
              styles.blob,
              {
                backgroundColor: 'rgba(33, 150, 243, 0.20)',
                width: width * 0.85,
                height: width * 0.85,
                bottom: -width * 0.4,
                right: -width * 0.3,
              },
              blobB,
            ]}
          />
          <Animated.View
            style={[
              styles.blob,
              {
                backgroundColor: 'rgba(38, 198, 218, 0.14)',
                width: width * 0.7,
                height: width * 0.7,
                top: height * 0.32,
                left: -width * 0.3,
              },
              blobC,
            ]}
          />
        </View>
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: theme.colors.starlight,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    // A true blur isn't available cross-platform without extra native deps,
    // so we lean on very low opacity + a huge radius to read as a soft glow.
    opacity: 0.9,
  },
});
