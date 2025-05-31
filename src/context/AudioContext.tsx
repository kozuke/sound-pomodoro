import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const AUDIO_STORAGE_KEY = 'pomodoro-audio-settings';

export interface AudioSettings {
  mainBgm: number; // 1-3
  endingBgm: number; // 1-3
  volume: number; // 0-1 (0: mute, 1: max volume)
}

interface AudioContextType {
  audioSettings: AudioSettings;
  updateMainBgm: (bgmNumber: number) => void;
  updateEndingBgm: (bgmNumber: number) => void;
  updateVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  mainBgm: 1,
  endingBgm: 1,
  volume: 0.7, // デフォルト音量70%
};

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    // 初期化時にlocalStorageから設定を読み込み
    const savedSettings = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return DEFAULT_AUDIO_SETTINGS;
      }
    }
    return DEFAULT_AUDIO_SETTINGS;
  });

  // localStorageに設定を保存
  useEffect(() => {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioSettings));
  }, [audioSettings]);

  const updateMainBgm = (bgmNumber: number) => {
    if (bgmNumber >= 1 && bgmNumber <= 3) {
      setAudioSettings(prev => ({
        ...prev,
        mainBgm: bgmNumber,
      }));
    }
  };

  const updateEndingBgm = (bgmNumber: number) => {
    if (bgmNumber >= 1 && bgmNumber <= 3) {
      setAudioSettings(prev => ({
        ...prev,
        endingBgm: bgmNumber,
      }));
    }
  };

  const updateVolume = (volume: number) => {
    if (volume >= 0 && volume <= 1) {
      setAudioSettings(prev => ({
        ...prev,
        volume: volume,
      }));
    }
  };

  const value: AudioContextType = {
    audioSettings,
    updateMainBgm,
    updateEndingBgm,
    updateVolume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 