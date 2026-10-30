import { Platform } from 'react-native';

export const Theme = {
  colors: {
    // Primary Grexa Palette
    primary: '#004328',
    primaryContainer: '#0D5C3A', // Deep forest emerald
    primaryFixed: '#A9F3C5',
    primaryFixedDim: '#8ED6AA',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#8AD2A7',

    // Secondary & Growth Indicators
    secondary: '#006C49',
    secondaryGrowth: '#10B981', // Radiant growth emerald for positive metrics
    secondaryContainer: '#6CF8BB',
    secondaryFixed: '#6FFBBE',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#00714D',

    // Extended Strategic Accents
    whatsappGreen: '#29A71A',
    whatsappGreenLight: '#E8F5E9',
    whatsappGreenDark: '#1E7E14',

    aiPurple: '#8B5CF6',
    aiPurpleLight: '#F3E8FF',
    aiPurpleDark: '#7C3AED',

    aiCyan: '#00C4DF',
    aiCyanLight: '#E0F7FA',

    warningAmber: '#F59E0B',
    warningAmberLight: '#FEF3C7',

    tertiary: '#2F65F6',
    tertiaryLight: '#EFF6FF',

    error: '#BA1A1A',
    errorLight: '#FFDAD6',

    // Neutrals & Surfaces
    surface: '#FAF8FF',
    surfaceBg: '#F8FAFC',
    surfaceSubtle: '#F1F5F9',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F2F3FF',
    surfaceContainer: '#EAEDFF',
    surfaceContainerHigh: '#E2E7FF',
    surfaceContainerHighest: '#DAE2FD',

    onSurface: '#131B2E',
    onSurfaceVariant: '#404942',
    outline: '#707971',
    outlineVariant: '#BFC9C0',
    borderSubtle: '#E2E8F0',
    borderMedium: '#CBD5E1',

    // Overlay & Backdrop
    backdrop: 'rgba(15, 23, 42, 0.4)',
    glassWhite: 'rgba(255, 255, 255, 0.85)',
  },

  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    gutter: 16,
  },

  typography: {
    hero: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '800' as const,
      letterSpacing: -0.8,
    },
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700' as const,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
    },
    labelSmall: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700' as const,
      letterSpacing: 0.4,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    hero: {
      shadowColor: '#0D5C3A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;

export const Colors = {
  light: {
    text: Theme.colors.onSurface,
    background: Theme.colors.surface,
    backgroundElement: Theme.colors.surfaceContainerLow,
    backgroundSelected: Theme.colors.surfaceContainer,
    textSecondary: Theme.colors.onSurfaceVariant,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121417',
    backgroundElement: '#181B20',
    backgroundSelected: '#22272E',
    textSecondary: '#A0AEC0',
  },
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  ...Theme.spacing,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const MaxContentWidth = 800;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
