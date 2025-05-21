import { useEffect, useRef } from 'react';
import { AUDIO_PATHS, TimerMode } from '../constants/timer';

// Add isFading property to HTMLAudioElement
declare global {
  interface HTMLAudioElement {
    isFading?: boolean;
  }
}

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

    // If already fading, don't start a new fade
    if (audioElement.isFading) {
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

    audioElement.isFading = true;
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
        audioElement.isFading = false;
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
      if (mainLofiAudioRef.current?.isFading) return;
      mainLofiAudioRef.current?.pause();
      if (endingLofiAudioRef.current?.isFading) return;
      endingLofiAudioRef.current?.pause();
      if (bellAudioRef.current?.isFading) return;
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
    if (mainLofiAudioRef.current && !mainLofiAudioRef.current.isFading) {
      mainLofiAudioRef.current.volume = volume;
    }
    if (endingLofiAudioRef.current && !endingLofiAudioRef.current.isFading) {
      endingLofiAudioRef.current.volume = volume;
    }
    if (bellAudioRef.current && !bellAudioRef.current.isFading) {
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
        if (!bellAudioRef.current.paused && !bellAudioRef.current.isFading) {
          fadeAudio(bellAudioRef.current, 0, 200, mainFadeIntervalRef, () => {
            if (!bellAudioRef.current?.isFading) {
              bellAudioRef.current?.pause();
            }
          });
        }

        if (remainingTime <= switchThreshold) {
          if (!hasTransitionedRef.current) {
            if (endingLofiAudioRef.current) {
              endingLofiAudioRef.current.currentTime = 0;
              endingLofiAudioRef.current.volume = 0;
            }

            if (!mainLofiAudioRef.current.isFading) {
              fadeAudio(mainLofiAudioRef.current, 0, 1000, mainFadeIntervalRef, () => {
                if (!mainLofiAudioRef.current?.isFading) {
                  mainLofiAudioRef.current?.pause();
                }
              });
            }

            if (!endingLofiAudioRef.current.isFading) {
              endingLofiAudioRef.current?.play()
                .then(() => {
                  fadeAudio(endingLofiAudioRef.current, 1, 1000, endingFadeIntervalRef);
                })
                .catch(error => {
                  console.error('Error playing ending lofi audio:', error.message);
                  if (mainLofiAudioRef.current && !mainLofiAudioRef.current.isFading) {
                    if (mainFadeIntervalRef.current) {
                      clearInterval(mainFadeIntervalRef.current);
                      mainFadeIntervalRef.current = null;
                    }
                    mainLofiAudioRef.current.volume = volume;
                    mainLofiAudioRef.current.play().catch(err => console.error('Error playing fallback audio:', err.message));
                  }
                  hasTransitionedRef.current = false;
                });
            }
            hasTransitionedRef.current = true;
          }
        } else {
          if (hasTransitionedRef.current) {
            if (mainLofiAudioRef.current) {
              mainLofiAudioRef.current.currentTime = 0;
              mainLofiAudioRef.current.volume = 0;
            }

            if (!endingLofiAudioRef.current.isFading) {
              fadeAudio(endingLofiAudioRef.current, 0, 1000, endingFadeIntervalRef, () => {
                if (!endingLofiAudioRef.current?.isFading) {
                  endingLofiAudioRef.current?.pause();
                }
              });
            }
            
            if (!mainLofiAudioRef.current.isFading) {
              mainLofiAudioRef.current?.play()
                .then(() => {
                  fadeAudio(mainLofiAudioRef.current, 1, 1000, mainFadeIntervalRef);
                })
                .catch(error => console.error('Error playing main lofi audio:', error.message));
            }
            hasTransitionedRef.current = false;
          } else {
            if (mainLofiAudioRef.current && mainLofiAudioRef.current.paused && !mainLofiAudioRef.current.isFading) {
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
            } else if (mainLofiAudioRef.current && !mainLofiAudioRef.current.paused && !mainLofiAudioRef.current.isFading) {
              if (mainLofiAudioRef.current.volume < volume && !mainFadeIntervalRef.current) {
                mainLofiAudioRef.current.volume = volume;
              }
            }
          }
        }
      } else if (mode === 'break') {
        if (mainLofiAudioRef.current && (!mainLofiAudioRef.current.paused || mainLofiAudioRef.current.volume > 0) && !mainLofiAudioRef.current.isFading) {
          fadeAudio(mainLofiAudioRef.current, 0, 500, mainFadeIntervalRef, () => {
            if (!mainLofiAudioRef.current?.isFading) {
              mainLofiAudioRef.current?.pause();
            }
          });
        }
        if (endingLofiAudioRef.current && (!endingLofiAudioRef.current.paused || endingLofiAudioRef.current.volume > 0) && !endingLofiAudioRef.current.isFading) {
          fadeAudio(endingLofiAudioRef.current, 0, 500, endingFadeIntervalRef, () => {
            if (!endingLofiAudioRef.current?.isFading) {
              endingLofiAudioRef.current?.pause();
            }
          });
        }
        hasTransitionedRef.current = false;

        if (bellAudioRef.current.paused && !bellAudioRef.current.isFading) {
          bellAudioRef.current.volume = volume;
          bellAudioRef.current.play().catch(error => console.error('Error playing bell audio for break:', error.message));
        }
      }
    } else {
      const fadeDuration = 500;
      const isReset = remainingTime === totalDuration;

      if (mainLofiAudioRef.current) {
        if ((!mainLofiAudioRef.current.paused || mainLofiAudioRef.current.volume > 0) && !mainLofiAudioRef.current.isFading) {
          fadeAudio(mainLofiAudioRef.current, 0, fadeDuration, mainFadeIntervalRef, () => {
            if (mainLofiAudioRef.current && !mainLofiAudioRef.current.isFading) {
              mainLofiAudioRef.current.pause();
              if (isReset) {
                mainLofiAudioRef.current.currentTime = 0;
              }
            }
          });
        } else if (!mainLofiAudioRef.current.isFading) {
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
        if ((!endingLofiAudioRef.current.paused || endingLofiAudioRef.current.volume > 0) && !endingLofiAudioRef.current.isFading) {
          fadeAudio(endingLofiAudioRef.current, 0, fadeDuration, endingFadeIntervalRef, () => {
            if (endingLofiAudioRef.current && !endingLofiAudioRef.current.isFading) {
              endingLofiAudioRef.current.pause();
              if (isReset) {
                endingLofiAudioRef.current.currentTime = 0;
              }
            }
          });
        } else if (!endingLofiAudioRef.current.isFading) {
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

      if (bellAudioRef.current && !bellAudioRef.current.isFading) {
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
    if (!bellAudioRef.current || bellAudioRef.current.isFading) return;
    
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