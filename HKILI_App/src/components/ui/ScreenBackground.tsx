import React from 'react';
import { StyleSheet, ViewStyle, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Adds soft decorative color blobs behind the content for extra depth. */
  decorated?: boolean;
}

/**
 * Full-screen night-sky gradient backdrop with optional glowing accent blobs.
 * Wrap a screen's root view with this to give it a richer, layered feel.
 */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  style,
  decorated = true,
}) => {
  const { width } = useWindowDimensions();

  return (
    <LinearGradient
      colors={theme.gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      {decorated && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.blob,
              {
                backgroundColor: 'rgba(0, 230, 118, 0.18)',
                width: width * 0.9,
                height: width * 0.9,
                top: -width * 0.45,
                left: -width * 0.3,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.blob,
              {
                backgroundColor: 'rgba(33, 150, 243, 0.16)',
                width: width * 0.8,
                height: width * 0.8,
                bottom: -width * 0.35,
                right: -width * 0.25,
              },
            ]}
          />
        </>
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    // A large blur radius isn't available cross-platform without extra deps,
    // so we lean on a very low opacity + huge radius to read as a soft glow.
    opacity: 0.9,
  },
});
