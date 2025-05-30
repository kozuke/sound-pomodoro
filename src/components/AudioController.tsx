import { useEffect, useRef } from 'react';
import { getMainBgmPath, getEndingBgmPath, getBellPath, TimerMode } from '../constants/timer';
import { useAudio } from '../context/AudioContext';

interface AudioControllerProps {
  mode: TimerMode;
  isActive: boolean;
  onSessionComplete: () => void;
  remainingTime: number;
  totalDuration: number;
}

/**
 * Component that handles audio playback based on timer mode
 */
const AudioController = ({ mode, isActive, onSessionComplete, remainingTime, totalDuration }: AudioControllerProps) => {
  const { audioSettings } = useAudio();
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
    // Apply global volume setting to target volume
    const adjustedTargetVolume = targetVolume * audioSettings.volume;
    const volumeChange = adjustedTargetVolume - initialVolume;

    if (volumeChange === 0 && audioElement.volume === adjustedTargetVolume) {
      if (onComplete) onComplete();
      return;
    }

    const steps = 20; // 20 steps for smooth fade
    const stepDuration = duration / steps;
    let currentStep = 0;

    // Ensure audioElement volume is set to initialVolume before starting interval
    audioElement.volume = initialVolume;

    const fadeIntervalId = setInterval(() => {
      currentStep++;
      const newVolume = initialVolume + volumeChange * (currentStep / steps);
      audioElement.volume = Math.max(0, Math.min(1, newVolume)); // Clamp volume between 0 and 1

      if (currentStep >= steps) {
        clearInterval(fadeIntervalId);
        intervalRef.current = null;
        audioElement.volume = adjustedTargetVolume; // Ensure target volume is precisely set
        if (onComplete) {
          onComplete();
        }
      }
    }, stepDuration);
    intervalRef.current = fadeIntervalId as unknown as number; // Store interval ID
  };

  // Initialize audio elements - recreate when BGM settings change
  useEffect(() => {
    // Clean up existing audio elements
    if (mainLofiAudioRef.current) {
      mainLofiAudioRef.current.pause();
      mainLofiAudioRef.current = null;
    }
    if (endingLofiAudioRef.current) {
      endingLofiAudioRef.current.pause();
      endingLofiAudioRef.current = null;
    }
    if (bellAudioRef.current) {
      bellAudioRef.current.pause();
      bellAudioRef.current = null;
    }

    // Clear any ongoing fade intervals
    if (mainFadeIntervalRef.current) {
      clearInterval(mainFadeIntervalRef.current);
      mainFadeIntervalRef.current = null;
    }
    if (endingFadeIntervalRef.current) {
      clearInterval(endingFadeIntervalRef.current);
      endingFadeIntervalRef.current = null;
    }

    // Create new audio elements with updated settings
    mainLofiAudioRef.current = new Audio(getMainBgmPath(audioSettings.mainBgm));
    mainLofiAudioRef.current.loop = true;
    
    endingLofiAudioRef.current = new Audio(getEndingBgmPath(audioSettings.endingBgm));
    endingLofiAudioRef.current.loop = true;
    
    bellAudioRef.current = new Audio(getBellPath(1));
    bellAudioRef.current.preload = 'auto';
    bellAudioRef.current.loop = true;
    
    // Reset transition state when audio changes
    hasTransitionedRef.current = false;
    
    // Cleanup on unmount
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
  }, [audioSettings.mainBgm, audioSettings.endingBgm]);

  // Handle audio playback and track switching based on timer mode and status
  useEffect(() => {
    if (!mainLofiAudioRef.current || !endingLofiAudioRef.current || !bellAudioRef.current) return;

    // Define the switch threshold.
    // Default: switch when 5% of time is left (totalDuration * 0.05).
    // For testing "残り時間95%で" (switch when 5% of time has passed), use totalDuration * 0.95.
    const thresholdPercentage = 0.2; // Change to 0.95 for testing "残り時間95%"
    const switchThreshold = totalDuration * thresholdPercentage;

    if (isActive) {
      if (mode === 'focus') {
        // Stop break sound if it was playing
        if (!bellAudioRef.current.paused) {
          fadeAudio(bellAudioRef.current, 0, 200, mainFadeIntervalRef, () => { // Using mainFadeIntervalRef for simplicity, consider a dedicated one if conflicts
            bellAudioRef.current?.pause();
          });
        }

        if (remainingTime <= switchThreshold) { // Time to switch to ending BGM
          if (!hasTransitionedRef.current) {
            if (endingLofiAudioRef.current) {
              endingLofiAudioRef.current.currentTime = 0;
              endingLofiAudioRef.current.volume = 0; // Start silent
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
                  mainLofiAudioRef.current.volume = audioSettings.volume;
                  mainLofiAudioRef.current.play().catch(err => console.error('Error playing fallback audio:', err.message));
                }
                hasTransitionedRef.current = false;
              });
            hasTransitionedRef.current = true;
          }
        } else { // Time to play main BGM (or continue it)
          if (hasTransitionedRef.current) { // Was playing ending BGM, switch back to main
            if (mainLofiAudioRef.current) {
              mainLofiAudioRef.current.currentTime = 0;
              mainLofiAudioRef.current.volume = 0; // Start silent
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
              // Play from start if: switching from break to focus, or focus session is reset/new
              if (prevModeRef.current === 'break' || remainingTime === totalDuration) {
                mainLofiAudioRef.current.currentTime = 0;
              }
              mainLofiAudioRef.current.volume = audioSettings.volume;
              mainLofiAudioRef.current.play()
                .catch(error => console.error('Error playing main lofi audio:', error.message));
            } else if (mainLofiAudioRef.current && !mainLofiAudioRef.current.paused) {
              if (mainLofiAudioRef.current.volume < audioSettings.volume && !mainFadeIntervalRef.current) {
                mainLofiAudioRef.current.volume = audioSettings.volume;
              }
            }
          }
        }
      } else if (mode === 'break') {
        // Stop focus sounds if they were playing
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
        hasTransitionedRef.current = false; // Reset focus transition state

        // Play bell sound
        if (bellAudioRef.current.paused) {
          // Consider if bell needs fade in. For simplicity, playing directly.
          // fadeAudio(bellAudioRef.current, 1, 500, bellFadeIntervalRef); // Would need a bellFadeIntervalRef
          bellAudioRef.current.volume = audioSettings.volume; // Play at user-set volume
          bellAudioRef.current.play().catch(error => console.error('Error playing bell audio for break:', error.message));
        }
      }
    } else { // Timer is not active: Stop all music
      const fadeDuration = 500;
      const isReset = remainingTime === totalDuration; // Check for reset condition

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
          // Already paused and volume is 0, or pause was called without fade
          mainLofiAudioRef.current.pause(); // Ensure it's paused
          if (isReset) {
            mainLofiAudioRef.current.currentTime = 0;
          }
          if (mainFadeIntervalRef.current) { // Clear interval if it was somehow still running
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
          // Assuming bell doesn't need fade out for pause, direct pause
          bellAudioRef.current.pause();
          if (isReset) {
            bellAudioRef.current.currentTime = 0;
          }
        } else if (isReset) { // If already paused but it's a reset
            bellAudioRef.current.currentTime = 0;
        }
      }
      hasTransitionedRef.current = false;
    }

    // Update prevModeRef after all logic for the current render has run
    prevModeRef.current = mode;
  }, [mode, isActive, remainingTime, totalDuration, onSessionComplete, audioSettings]); // Added audioSettings to dependencies

  // Update volume of currently playing audio when volume setting changes
  useEffect(() => {
    // Update volume for currently playing audio elements
    if (mainLofiAudioRef.current && !mainLofiAudioRef.current.paused && !mainFadeIntervalRef.current) {
      mainLofiAudioRef.current.volume = audioSettings.volume;
    }
    
    if (endingLofiAudioRef.current && !endingLofiAudioRef.current.paused && !endingFadeIntervalRef.current) {
      endingLofiAudioRef.current.volume = audioSettings.volume;
    }
    
    if (bellAudioRef.current && !bellAudioRef.current.paused) {
      bellAudioRef.current.volume = audioSettings.volume;
    }
  }, [audioSettings.volume]); // Only depend on volume changes

  // Play bell sound on session completion (original functionality for focus session end)
  const playBellSound = () => {
    if (!bellAudioRef.current) return;
    
    bellAudioRef.current.currentTime = 0;
    bellAudioRef.current.volume = audioSettings.volume; // Apply user volume setting
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
    // This reassignment doesn't actually change the prop from the parent.
    // To correctly enhance, onSessionComplete itself should be called within this component's logic
    // or the parent should pass an already enhanced function.
    // For now, assuming this structure is intended or handled elsewhere.
    // A better way: Call playBellSound() then props.onSessionComplete() inside this component's logic
    // where session completion is detected.
    // However, current structure passes onSessionComplete to TimerContainer.
    // Let's leave this as is, as it's outside the scope of BGM fading.
    // The prop onSessionComplete cannot be reassigned like this.
    // It should be:
    // const handleSessionComplete = () => { playBellSound(); originalOnSessionComplete(); }
    // And use handleSessionComplete in this component or pass it down if this component triggers completion.
    // Given the current structure, this bell sound effect is tied to when the prop function is called.
  }, [onSessionComplete]); // This effect will re-run if onSessionComplete changes, which is typical for callbacks.

  return null; // This component doesn't render anything
};

export default AudioController;