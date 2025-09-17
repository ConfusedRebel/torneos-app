// src/hooks/useTheme.ts
import { useColorScheme as useRNColorScheme } from 'react-native';
import Colors, { ColorScheme } from '@/constants/Colors';

export function useTheme() {
  const scheme = (useRNColorScheme() ?? 'light') as ColorScheme;
  return { scheme, colors: Colors[scheme] };
}
