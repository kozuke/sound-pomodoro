// Timer durations in seconds
export const TIMER_PRESETS = [
  // { minutes: 1, label: '1分' }, // テストの際にコメントアウトを外す
  { minutes: 5, label: '5分' },
  { minutes: 10, label: '10分' },
  { minutes: 15, label: '15分' },
  { minutes: 20, label: '20分' },
  { minutes: 25, label: '25分' },
  { minutes: 30, label: '30分' },
] as const;

// Timer modes
export type TimerMode = 'focus' | 'break';

// Audio file paths utility functions
export const getMainBgmPath = (bgmNumber: number): string => {
  return `/audio/main_bgm_${bgmNumber}.mp3`;
};

export const getEndingBgmPath = (bgmNumber: number): string => {
  return `/audio/ending_bgm_${bgmNumber}.mp3`;
};

export const getBellPath = (bellNumber: number = 1): string => {
  return `/audio/bell_${bellNumber}.mp3`;
};

// Legacy audio paths - keeping for backward compatibility
export const AUDIO_PATHS = {
  lofi: '/audio/main_bgm_1.mp3',
  lofiEnding: '/audio/ending_bgm.mp3',
  bell: '/audio/bell_1.mp3'
};