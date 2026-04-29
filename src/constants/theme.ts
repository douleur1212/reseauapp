// ══════════════════════════════════════════════════
//  RÉSEAU — Design Tokens (transposés depuis CSS)
// ══════════════════════════════════════════════════

export const COLORS = {
  rose:    '#E8305A',
  rose2:   '#c0234a',
  violet:  '#a855f7',
  bleu:    '#6ab4ff',
  green:   '#22c55e',
  gold:    '#d4a843',

  dark:    '#0B0714',
  dark2:   '#120d1e',
  dark3:   '#1a1230',

  card:    'rgba(255,255,255,0.05)',
  border:  'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.14)',

  text:    '#f0eafa',
  muted:   'rgba(240,234,250,0.45)',
  muted2:  'rgba(240,234,250,0.30)',
  white:   '#ffffff',

  // Gradients (utilisés avec LinearGradient)
  gradRose:   ['#E8305A', '#c0234a'],
  gradViolet: ['#E8305A', '#a855f7'],
  gradGold:   ['#d4a843', '#e6a817'],
  gradGreen:  ['#22c55e', '#15803d'],
  gradDark:   ['#120d1e', '#1a1230'],
  gradPage:   ['#0B0714', '#1a1230'],
};

export const TYPOGRAPHY = {
  serif:  'PlayfairDisplay_700Bold',
  serifI: 'PlayfairDisplay_400Italic',
  sans:   'DMSans_400Regular',
  sansMd: 'DMSans_500Medium',
  sansBd: 'DMSans_600SemiBold',
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  22,
  full: 100,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  rose: {
    shadowColor: '#E8305A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};
