import { useEffect, useRef } from 'react';
import { AUDIO_PATHS, TimerMode } from '../constants/timer';

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
  const mainLofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const endingLofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasTransitionedRef = useRef(false);

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
        audioElement.volume = targetVolume; // Ensure target volume is precisely set
        if (onComplete) {
          onComplete();
        }
      }
    }, stepDuration);
    intervalRef.current = fadeIntervalId as unknown as number; // Store interval ID
  };

  // Initialize audio elements
  useEffect(() => {
    mainLofiAudioRef.current = new Audio(AUDIO_PATHS.lofi);
    mainLofiAudioRef.current.loop = true;
    
    endingLofiAudioRef.current = new Audio(AUDIO_PATHS.lofiEnding);
    endingLofiAudioRef.current.loop = true;
    
    bellAudioRef.current = new Audio(AUDIO_PATHS.bell);
    bellAudioRef.current.preload = 'auto';
    
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
  }, []);

  // Handle audio playback and track switching based on timer mode and status
  useEffect(() => {
    if (!mainLofiAudioRef.current || !endingLofiAudioRef.current) return;

    // Define the switch threshold.
    // Default: switch when 5% of time is left (totalDuration * 0.05).
    // For testing "残り時間95%で" (switch when 5% of time has passed), use totalDuration * 0.95.
    const thresholdPercentage = 0.05; // Change to 0.95 for testing "残り時間95%"
    const switchThreshold = totalDuration * thresholdPercentage;

    if (mode === 'focus' && isActive) {
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
                if (mainFadeIntervalRef.current) { // Clear any fade out on main
                  clearInterval(mainFadeIntervalRef.current);
                  mainFadeIntervalRef.current = null;
                }
                mainLofiAudioRef.current.volume = 1; // Restore volume
                mainLofiAudioRef.current.play().catch(err => console.error('Error playing fallback audio:', err.message));
              }
              hasTransitionedRef.current = false; // Revert transition as ending failed
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
          // Main BGM should be playing, not a transition FROM ending.
          if (mainLofiAudioRef.current && mainLofiAudioRef.current.paused) {
            if (mainFadeIntervalRef.current) { // Clear any active fade on main
               clearInterval(mainFadeIntervalRef.current);
               mainFadeIntervalRef.current = null;
            }
            mainLofiAudioRef.current.volume = 1; // Play at full volume
            // mainLofiAudioRef.current.currentTime = 0; // Consider if resuming or restarting. Original code restarted.
            mainLofiAudioRef.current.play()
              .catch(error => console.error('Error playing main lofi audio:', error.message));
          } else if (mainLofiAudioRef.current && !mainLofiAudioRef.current.paused) {
            // If already playing, ensure volume is correct (e.g., if a fade was interrupted)
            if (mainLofiAudioRef.current.volume < 1 && !mainFadeIntervalRef.current) {
              mainLofiAudioRef.current.volume = 1; // Ramp up to full if partially faded and no fade active
            }
          }
        }
      }
    } else { // Not focus mode or not active: Stop all music with fade
      const fadeDuration = 500; // Shorter fade for stop/pause
      if (mainLofiAudioRef.current && (!mainLofiAudioRef.current.paused || mainLofiAudioRef.current.volume > 0)) {
        fadeAudio(mainLofiAudioRef.current, 0, fadeDuration, mainFadeIntervalRef, () => {
          mainLofiAudioRef.current?.pause();
        });
      } else if (mainLofiAudioRef.current) {
         mainLofiAudioRef.current.pause(); // Ensure paused if not playing
         if (mainFadeIntervalRef.current) { clearInterval(mainFadeIntervalRef.current); mainFadeIntervalRef.current = null; }
      }

      if (endingLofiAudioRef.current && (!endingLofiAudioRef.current.paused || endingLofiAudioRef.current.volume > 0)) {
        fadeAudio(endingLofiAudioRef.current, 0, fadeDuration, endingFadeIntervalRef, () => {
          endingLofiAudioRef.current?.pause();
        });
      } else if (endingLofiAudioRef.current) {
         endingLofiAudioRef.current.pause(); // Ensure paused
         if (endingFadeIntervalRef.current) { clearInterval(endingFadeIntervalRef.current); endingFadeIntervalRef.current = null; }
      }
      hasTransitionedRef.current = false;
    }
  }, [mode, isActive, remainingTime, totalDuration]);

  // Play bell sound on session completion
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