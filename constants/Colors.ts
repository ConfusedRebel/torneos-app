// src/constants/Colors.ts
const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#F7F7F7',
    text: '#11181C',
    tint: '#0A84FF',
    border: '#E6E6E6',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
  },
  dark: {
    background: '#555555ff',
    card: '#121212',
    text: '#ECEDEE',
    tint: '#64D2FF',
    border: '#2A2A2A',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#64D2FF',
  },
} as const;

export default Colors;
export type ColorScheme = keyof typeof Colors; // 'light' | 'dark'
