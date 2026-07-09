export const theme = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    secondary: '#2196F3',
    background: '#0A1929',
    surface: '#1E3A8A',
    surfaceVariant: '#1565C0',
    text: '#ffffff',
    textSecondary: '#81C784',
    textMuted: '#64B5F6',
    accent: '#00E676',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    border: '#1976D2',
    overlay: 'rgba(10, 25, 41, 0.8)',
    glassBorder: 'rgba(129, 199, 132, 0.25)',
    glassFill: 'rgba(255, 255, 255, 0.06)',
  },
  // Gradient palettes for `expo-linear-gradient` (use as the `colors` prop).
  gradients: {
    // Deep night-sky backdrop used app-wide.
    background: ['#0A1929', '#0D2137', '#0A1F33'] as const,
    // Primary call-to-action — vivid green glow.
    primary: ['#00E676', '#1FB85F', '#2E7D32'] as const,
    // Cool secondary accent.
    secondary: ['#42A5F5', '#1E88E5', '#1565C0'] as const,
    // Warm coin / reward accent.
    gold: ['#FFE082', '#FFC107', '#FF8F00'] as const,
    // Subtle card surface sheen.
    card: ['rgba(33, 150, 243, 0.18)', 'rgba(76, 175, 80, 0.10)'] as const,
    // Selected / active highlight.
    highlight: ['rgba(0, 230, 118, 0.35)', 'rgba(33, 150, 243, 0.18)'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
  },
    // NOTE: Android `elevation` on translucent (glass) cards renders the shadow
    // through/around the rounded edges and reads as an ugly "box inside a box".
    // So the neutral card shadows keep the (subtle) iOS shadow but set
    // elevation: 0 — the green border already gives cards their definition.
    // Only the glow presets (used on OPAQUE gradient buttons) keep elevation.
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 0,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 0,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 0,
    },
    // Colored glow for accent elements (CTAs, selected cards).
    glow: {
      shadowColor: '#00E676',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 12,
    },
    glowGold: {
      shadowColor: '#FFC107',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 10,
    },
  },
} as const;