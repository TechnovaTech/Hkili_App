import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

const theme = {
  colors: {
    primary: '#6366f1',
    background: '#0f0f0f',
    textSecondary: '#a1a1aa',
  },
  spacing: {
    md: 16,
    lg: 24,
  },
  typography: {
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
  },
};

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'large',
  style,
  fullScreen = false,
}) => {
  const containerStyle = [
    fullScreen ? styles.fullScreen : styles.container,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
        style={styles.spinner}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});