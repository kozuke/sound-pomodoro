export interface Theme {
  id: string;
  name: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  buttonPrimary: string;
  buttonSecondary: string;
  focusColor: string;
  breakColor: string;
}

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'ダーク',
    background: 'bg-gray-900',
    cardBackground: 'bg-gray-800',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    accent: 'bg-violet-600',
    accentHover: 'hover:bg-violet-700',
    buttonPrimary: 'bg-gray-700 hover:bg-gray-600',
    buttonSecondary: 'bg-blue-600 hover:bg-blue-700',
    focusColor: 'text-emerald-400',
    breakColor: 'text-blue-400',
  },
  {
    id: 'soft-blue',
    name: 'ソフトブルー',
    background: 'bg-slate-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-600',
    accent: 'bg-sky-500',
    accentHover: 'hover:bg-sky-600',
    buttonPrimary: 'bg-slate-100 hover:bg-slate-200',
    buttonSecondary: 'bg-sky-500 hover:bg-sky-600',
    focusColor: 'text-sky-600',
    breakColor: 'text-indigo-500',
  },
  {
    id: 'warm-beige',
    name: 'ウォームベージュ',
    background: 'bg-amber-100',
    cardBackground: 'bg-amber-50',
    textPrimary: 'text-amber-900',
    textSecondary: 'text-amber-800',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    buttonPrimary: 'bg-amber-200 hover:bg-amber-300',
    buttonSecondary: 'bg-amber-700 hover:bg-amber-800',
    focusColor: 'text-amber-800',
    breakColor: 'text-orange-700',
  },
  {
    id: 'pastel-pink',
    name: 'パステルピンク',
    background: 'bg-pink-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-pink-900',
    textSecondary: 'text-pink-700',
    accent: 'bg-pink-400',
    accentHover: 'hover:bg-pink-500',
    buttonPrimary: 'bg-pink-100 hover:bg-pink-200',
    buttonSecondary: 'bg-pink-400 hover:bg-pink-500',
    focusColor: 'text-pink-500',
    breakColor: 'text-purple-400',
  },
  {
    id: 'energy-orange',
    name: 'エナジーオレンジ',
    background: 'bg-orange-900',
    cardBackground: 'bg-orange-800',
    textPrimary: 'text-orange-50',
    textSecondary: 'text-orange-200',
    accent: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
    buttonPrimary: 'bg-orange-700 hover:bg-orange-600',
    buttonSecondary: 'bg-red-500 hover:bg-red-600',
    focusColor: 'text-orange-300',
    breakColor: 'text-red-300',
  },
];

export const DEFAULT_THEME_ID = 'dark'; 