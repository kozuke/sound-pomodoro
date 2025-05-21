import { useEffect, useRef } from 'react';
import { AUDIO_PATHS, TimerMode } from '../constants/timer';

interface AudioControllerProps {
  mode: TimerMode;
  isActive: boolean;
  onSessionComplete: () => void;
  remainingTime: number;
  totalDuration: number;
  volume: number;
}

const AudioController = ({ mode, isActive, onSessionComplete, remainingTime, totalDuration, volume }: AudioControllerProps) => {
  const mainLofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const endingLofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasTransitionedRef = useRef(false);
  const prevModeRef = useRef<TimerMode | null>(null);

  const mainFadeIntervalRef = useRef<number | null>(null);
  const endingFadeIntervalRef = useRef<number | null>(null);

  // Helper function for fading audio
  const fadeAudio = (
    audioElement: HTMLAudioElement | null,
    targetVolume: number,
    duration: number,
    intervalRef: React.MutableRefObject<number | null>,
    onComplete?: () => void
  ) => {
    if (!audioElement) {
      if (onComplete) onComplete();
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const initialVolume = audioElement.volume;
    const volumeChange = targetVolume - initialVolume;

    if (volumeChange === 0 && audioElement.volume === targetVolume) {
      if (onComplete) onComplete();
      return;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    audioElement.volume = initialVolume;

    const fadeIntervalId = setInterval(() => {
      currentStep++;
      const newVolume = initialVolume + volumeChange * (currentStep / steps);
      audioElement.volume = Math.max(0, Math.min(1, newVolume * volume));

      if (currentStep >= steps) {
        clearInterval(fadeIntervalId);
        intervalRef.current = null;
        audioElement.volume = targetVolume * volume;
        if (onComplete) {
          onComplete();
        }
      }
    }, stepDuration);
    intervalRef.current = fadeIntervalId as unknown as number;
  };

  // Initialize audio elements
  useEffect(() => {
    mainLofiAudioRef.current = new Audio(AUDIO_PATHS.lofi);
    mainLofiAudioRef.current.loop = true;
    mainLofiAudioRef.current.volume = volume;
    
    endingLofiAudioRef.current = new Audio(AUDIO_PATHS.lofiEnding);
    endingLofiAudioRef.current.loop = true;
    endingLofiAudioRef.current.volume = volume;
    
    bellAudioRef.current = new Audio(AUDIO_PATHS.bell);
    bellAudioRef.current.preload = 'auto';
    bellAudioRef.current.loop = true;
    bellAudioRef.current.volume = volume;
    
    return () => {
      mainLofiAudioRef.current?.pause();
      endingLofiAudioRef.current?.pause();
      bellAudioRef.current?.pause();

      if (mainFadeIntervalRef.current) {
        clearInterval(mainFadeIntervalRef.current);
        mainFadeIntervalRef.current = null;
      }
      if (endingFadeIntervalRef.current) {
        clearInterval(endingFadeIntervalRef.current);
        endingFadeIntervalRef.current = null;
      }
    };
  }, [volume]);

  // Update volume when it changes
  useEffect(() => {
    if (mainLofiAudioRef.current) {
      mainLofiAudioRef.current.volume = volume;
    }
    if (endingLofiAudioRef.current) {
      endingLofiAudioRef.current.volume = volume;
    }
    if (bellAudioRef.current) {
      bellAudioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle audio playback and track switching based on timer mode and status
  useEffect(() => {
    if (!mainLofiAudioRef.current || !endingLofiAudioRef.current || !bellAudioRef.current) return;

    const thresholdPercentage = 0.2;
    const switchThreshold = totalDuration * thresholdPercentage;

    if (isActive) {
      if (mode === 'focus') {
        if (!bellAudioRef.current.paused) {
          fadeAudio(bellAudioRef.current, 0, 200, mainFadeIntervalRef, () => {
            bellAudioRef.current?.pause();
          });
        }

        if (remainingTime <= switchThreshold) {
          if (!hasTransitionedRef.current) {
            if (endingLofiAudioRef.current) {
              endingLofiAudioRef.current.currentTime = 0;
              endingLofiAudioRef.current.volume = 0;
            }

            fadeAudio(mainLofiAudioRef.current, 0, 1000, mainFadeIntervalRef, () => {
              mainLofiAudioRef.current?.pause();
            });

            endingLofiAudioRef.current?.play()
              .then(() => {
                fadeAudio(endingLofiAudioRef.current, 1, 1000, endingFadeIntervalRef);
              })
              .catch(error => {
                console.error('Error playing ending lofi audio:', error.message);
                if (mainLofiAudioRef.current) {
                  if (mainFadeIntervalRef.current) {
                    clearInterval(mainFadeIntervalRef.current);
                    mainFadeIntervalRef.current = null;
                  }
                  mainLofiAudioRef.current.volume = volume;
                  mainLofiAudioRef.current.play().catch(err => console.error('Error playing fallback audio:', err.message));
                }
                hasTransitionedRef.current = false;
              });
            hasTransitionedRef.current = true;
          }
        } else {
          if (hasTransitionedRef.current) {
            if (mainLofiAudioRef.current) {
              mainLofiAudioRef.current.currentTime = 0;
              mainLofiAudioRef.current.volume = 0;
            }

            fadeAudio(endingLofiAudioRef.current, 0, 1000, endingFadeIntervalRef, () => {
              endingLofiAudioRef.current?.pause();
            });
            
            mainLofiAudioRef.current?.play()
              .then(() => {
                fadeAudio(mainLofiAudioRef.current, 1, 1000, mainFadeIntervalRef);
              })
              .catch(error => console.error('Error playing main lofi audio:', error.message));
            hasTransitionedRef.current = false;
          } else {
            if (mainLofiAudioRef.current && mainLofiAudioRef.current.paused) {
              if (mainFadeIntervalRef.current) {
                 clearInterval(mainFadeIntervalRef.current);
                 mainFadeIntervalRef.current = null;
              }
              if (prevModeRef.current === 'break' || remainingTime === totalDuration) {
                mainLofiAudioRef.current.currentTime = 0;
              }
              mainLofiAudioRef.current.volume = volume;
              mainLofiAudioRef.current.play()
                .catch(error => console.error('Error playing main lofi audio:', error.message));
            } else if (mainLofiAudioRef.current && !mainLofiAudioRef.current.paused) {
              if (mainLofiAudioRef.current.volume < volume && !mainFadeIntervalRef.current) {
                mainLofiAudioRef.current.volume = volume;
              }
            }
          }
        }
      } else if (mode === 'break') {
        if (mainLofiAudioRef.current && (!mainLofiAudioRef.current.paused || mainLofiAudioRef.current.volume > 0)) {
          fadeAudio(mainLofiAudioRef.current, 0, 500, mainFadeIntervalRef, () => {
            mainLofiAudioRef.current?.pause();
          });
        }
        if (endingLofiAudioRef.current && (!endingLofiAudioRef.current.paused || endingLofiAudioRef.current.volume > 0)) {
          fadeAudio(endingLofiAudioRef.current, 0, 500, endingFadeIntervalRef, () => {
            endingLofiAudioRef.current?.pause();
          });
        }
        hasTransitionedRef.current = false;

        if (bellAudioRef.current.paused) {
          bellAudioRef.current.volume = volume;
          bellAudioRef.current.play().catch(error => console.error('Error playing bell audio for break:', error.message));
        }
      }
    } else {
      const fadeDuration = 500;
      const isReset = remainingTime === totalDuration;

      if (mainLofiAudioRef.current) {
        if (!mainLofiAudioRef.current.paused || mainLofiAudioRef.current.volume > 0) {
          fadeAudio(mainLofiAudioRef.current, 0, fadeDuration, mainFadeIntervalRef, () => {
            if (mainLofiAudioRef.current) {
              mainLofiAudioRef.current.pause();
              if (isReset) {
                mainLofiAudioRef.current.currentTime = 0;
              }
            }
          });
        } else {
          mainLofiAudioRef.current.pause();
          if (isReset) {
            mainLofiAudioRef.current.currentTime = 0;
          }
          if (mainFadeIntervalRef.current) {
            clearInterval(mainFadeIntervalRef.current);
            mainFadeIntervalRef.current = null;
          }
        }
      }

      if (endingLofiAudioRef.current) {
        if (!endingLofiAudioRef.current.paused || endingLofiAudioRef.current.volume > 0) {
          fadeAudio(endingLofiAudioRef.current, 0, fadeDuration, endingFadeIntervalRef, () => {
            if (endingLofiAudioRef.current) {
              endingLofiAudioRef.current.pause();
              if (isReset) {
                endingLofiAudioRef.current.currentTime = 0;
              }
            }
          });
        } else {
          endingLofiAudioRef.current.pause();
          if (isReset) {
            endingLofiAudioRef.current.currentTime = 0;
          }
          if (endingFadeIntervalRef.current) {
            clearInterval(endingFadeIntervalRef.current);
            endingFadeIntervalRef.current = null;
          }
        }
      }

      if (bellAudioRef.current) {
        if (!bellAudioRef.current.paused) {
          bellAudioRef.current.pause();
          if (isReset) {
            bellAudioRef.current.currentTime = 0;
          }
        } else if (isReset) {
            bellAudioRef.current.currentTime = 0;
        }
      }
      hasTransitionedRef.current = false;
    }

    prevModeRef.current = mode;
  }, [mode, isActive, remainingTime, totalDuration, volume, onSessionComplete]);

  const playBellSound = () => {
    if (!bellAudioRef.current) return;
    
    bellAudioRef.current.currentTime = 0;
    bellAudioRef.current.play()
      .catch(error => {
        console.error('Error playing bell audio:', error.message);
      });
  };

  useEffect(() => {
    const originalOnSessionComplete = onSessionComplete;
    const enhancedOnSessionComplete = () => {
      playBellSound();
      originalOnSessionComplete();
    };
  }, [onSessionComplete]);

  return null;
};

export default AudioController;