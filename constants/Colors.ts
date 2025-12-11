// src/constants/Colors.ts

const Colors = {
  light: {
    background: '#FFFFFF',       // Fondo general claro
    card: '#F7F7F7',             // Tarjetas / bloques
    text: '#11181C',             // Texto principal
    tint: '#0A84FF',             // Color de acción (iOS Blue)
    border: '#E6E6E6',           // Bordes suaves
    mutedText: '#6B7280',        // Texto secundario
    onTint: '#FFFFFF',           // Texto sobre botones tint
    clubCard: '#E8F1FF',         // Fondo especial torneos de club
    clubBorder: '#B9D0FF',       // Borde especial torneos de club
    tabIconDefault: '#8E8E93',   // Iconos inactivos
    tabIconSelected: '#0A84FF',  // Iconos activos
  },

  dark: {
    background: '#555555ff',     // Fondo base oscuro (tu color actual)
    card: '#121212',             // Tarjetas en dark mode
    text: '#ECEDEE',             // Texto claro
    tint: '#64D2FF',             // Acción / botones
    border: '#2A2A2A',           // Bordes en dark
    mutedText: '#A1A1AA',        // Secundario en dark
    onTint: '#0A0A0A',           // Texto sobre tint
    clubCard: '#0F172A',         // Fondo azul profundo para torneos club
    clubBorder: '#1D4ED8',       // Borde azul vibrante
    tabIconDefault: '#8E8E93',   // Inactivo
    tabIconSelected: '#64D2FF',  // Activo
  },
} as const;

export default Colors;

// "light" | "dark"
export type ColorScheme = keyof typeof Colors;
