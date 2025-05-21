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

// Audio file paths - using reliable, freely available audio files
export const AUDIO_PATHS = {
  lofi: [
    { id: 1, path: '/audio/main_bgm_1.mp3', label: 'Lo-fi 1' },
    { id: 2, path: '/audio/main_bgm_2.mp3', label: 'Lo-fi 2' },
  ],
  lofiEnding: '/audio/ending_bgm.mp3',
  bell: [
    { id: 1, path: '/audio/bell_1.mp3', label: 'Bell 1' },
    { id: 2, path: '/audio/bell_2.mp3', label: 'Bell 2' },
  ]
} as const;