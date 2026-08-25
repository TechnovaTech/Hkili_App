import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

type Glow = 'none' | 'green' | 'blue' | 'teal' | 'gold';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Inner padding preset. */
  padded?: boolean;
  /** Highlighted/selected state — brighter fill + accent border. */
  active?: boolean;
  /** Coloured outer glow. */
  glow?: Glow;
  /** Adds a diagonal light sheen across the top-left edge. */
  sheen?: boolean;
}

const glowStyle = (glow: Glow) => {
  switch (glow) {
    case 'green':
      return theme.shadows.glow;
    case 'blue':
      return theme.shadows.glowBlue;
    case 'teal':
      return theme.shadows.glowTeal;
    case 'gold':
      return theme.shadows.glowGold;
    default:
      return null;
  }
};

/**
 * Frosted "glass" surface: translucent gradient fill, hairline luminous border
 * and an optional diagonal sheen so cards catch the light like real glass.
 *
 * Deliberately avoids Android `elevation` — on translucent rounded surfaces it
 * paints a hard shadow box around the edges. The border carries the definition.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padded = true,
  active = false,
  glow = 'none',
  sheen = true,
}) => {
  const outerGlow = glowStyle(glow);

  return (
    <View style={[outerGlow, style]}>
      <View
        style={[
          styles.clip,
          active ? styles.borderActive : styles.border,
        ]}
      >
        <LinearGradient
          colors={active ? theme.gradients.highlight : theme.gradients.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {sheen && (
          <LinearGradient
            colors={theme.gradients.sheen}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0.7 }}
            style={styles.sheen}
            pointerEvents="none"
          />
        )}
        <View style={padded ? styles.paddedContent : undefined}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.glassFill,
  },
  border: {
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  borderActive: {
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  paddedContent: {
    padding: theme.spacing.md,
  },
});
