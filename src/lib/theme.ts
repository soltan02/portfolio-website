// Single source of truth for the palette used outside Tailwind's reach —
// three.js materials, canvas 2D, and inline gradient strings all need raw
// values, not class names. Keep these in sync with tailwind.config.js's
// `theme.extend.colors` (that file can't import this one — see its comment).
export const COLORS = {
  ink: '#0C0C0C',
  mist: '#D7E2EA',
  paper: '#FFFFFF',
  accent: {
    deep: '#18011F',
    magenta: '#B600A8',
    violet: '#7621B0',
    ember: '#BE4C00',
  },
} as const;

export const ACCENT_CYCLE = [COLORS.accent.magenta, COLORS.accent.violet, COLORS.accent.ember] as const;
