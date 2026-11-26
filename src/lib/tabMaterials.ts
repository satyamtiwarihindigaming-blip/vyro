export type MaterialType =
  | 'velvet-ceramic'
  | 'oled-cinema'
  | 'brushed-studio'
  | 'frosted-glass'
  | 'matte-slate'
  | 'matte-carbon'
  | 'neo-arcade'
  | 'obsidian-monograph';

export interface TabMaterialConfig {
  type: MaterialType;
  canvasBg: string;
  cardBg: string;
  cardBorder: string;
  accentGlow: string;
  grainOpacity: number;
}

export const TAB_MATERIALS: Record<MaterialType, TabMaterialConfig> = {
  'velvet-ceramic': {
    type: 'velvet-ceramic',
    canvasBg: 'bg-[#0A0A0D]',
    cardBg: 'bg-[#121217]/85',
    cardBorder: 'border-white/[0.08]',
    accentGlow: 'rgba(99, 102, 241, 0.12)',
    grainOpacity: 0.025,
  },
  'oled-cinema': {
    type: 'oled-cinema',
    canvasBg: 'bg-[#000000]',
    cardBg: 'bg-[#050505]/90',
    cardBorder: 'border-white/[0.06]',
    accentGlow: 'rgba(255, 255, 255, 0.08)',
    grainOpacity: 0.015,
  },
  'brushed-studio': {
    type: 'brushed-studio',
    canvasBg: 'bg-[#0E1015]',
    cardBg: 'bg-[#151821]/80',
    cardBorder: 'border-white/[0.12]',
    accentGlow: 'rgba(6, 182, 212, 0.15)',
    grainOpacity: 0.03,
  },
  'frosted-glass': {
    type: 'frosted-glass',
    canvasBg: 'bg-[#090A10]',
    cardBg: 'bg-white/[0.06]',
    cardBorder: 'border-white/[0.16]',
    accentGlow: 'rgba(168, 85, 247, 0.15)',
    grainOpacity: 0.02,
  },
  'matte-slate': {
    type: 'matte-slate',
    canvasBg: 'bg-[#090A0E]',
    cardBg: 'bg-[#11131A]/85',
    cardBorder: 'border-white/[0.10]',
    accentGlow: 'rgba(14, 165, 233, 0.12)',
    grainOpacity: 0.035,
  },
  'matte-carbon': {
    type: 'matte-carbon',
    canvasBg: 'bg-[#070709]',
    cardBg: 'bg-[#0E0F14]/90',
    cardBorder: 'border-white/[0.10]',
    accentGlow: 'rgba(236, 72, 153, 0.12)',
    grainOpacity: 0.04,
  },
  'neo-arcade': {
    type: 'neo-arcade',
    canvasBg: 'bg-[#0C0E14]',
    cardBg: 'bg-[#141822]/85',
    cardBorder: 'border-white/[0.12]',
    accentGlow: 'rgba(234, 179, 8, 0.15)',
    grainOpacity: 0.03,
  },
  'obsidian-monograph': {
    type: 'obsidian-monograph',
    canvasBg: 'bg-[#08090D]',
    cardBg: 'bg-[#101218]/85',
    cardBorder: 'border-white/[0.10]',
    accentGlow: 'rgba(139, 92, 246, 0.14)',
    grainOpacity: 0.025,
  },
};

export function getMaterialForRoute(pathname: string): TabMaterialConfig {
  if (pathname === '/reels') return TAB_MATERIALS['oled-cinema'];
  if (pathname === '/music') return TAB_MATERIALS['brushed-studio'];
  if (pathname === '/direct') return TAB_MATERIALS['frosted-glass'];
  if (pathname === '/explore') return TAB_MATERIALS['matte-slate'];
  if (pathname === '/create') return TAB_MATERIALS['matte-carbon'];
  if (pathname === '/games') return TAB_MATERIALS['neo-arcade'];
  if (pathname === '/feed') return TAB_MATERIALS['velvet-ceramic'];
  if (pathname.length > 1 && !pathname.includes('/')) return TAB_MATERIALS['obsidian-monograph'];
  return TAB_MATERIALS['velvet-ceramic'];
}
