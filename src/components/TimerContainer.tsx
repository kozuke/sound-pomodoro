import { useState, useEffect, useCallback } from 'react';
import { Music, Coffee, Settings as SettingsIcon } from 'lucide-react';
import { TIMER_PRESETS, TimerMode } from '../constants/timer';
import CircularTimer from './CircularTimer';
import Controls from './Controls';
import AudioController from './AudioController';
import Settings from './Settings';
import { useTheme } from '../context/ThemeContext';

/**
 * Main container component for the Pomodoro timer functionality
 */
const TimerContainer = () => {
  const { currentTheme } = useTheme();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remainingTime, setRemainingTime] = useState(selectedMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get current duration based on mode
  const getCurrentDuration = useCallback(() => {
    const focusDuration = selectedMinutes * 60;
    return mode === 'focus' ? focusDuration : Math.floor(focusDuration * 0.2);
  }, [mode, selectedMinutes]);
  
  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    const nextDuration = nextMode === 'focus' ? selectedMinutes * 60 : Math.floor(selectedMinutes * 60 * 0.2);
    
    setMode(nextMode);
    setRemainingTime(nextDuration);
  }, [mode, selectedMinutes]);
  
  // Timer tick effect
  useEffect(() => {
    if (!isActive) return;
    
    const intervalId = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          handleSessionComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isActive, handleSessionComplete]);
  
  // Reset the timer
  const handleReset = useCallback(() => {
    setIsActive(false);
    setMode('focus');
    setRemainingTime(selectedMinutes * 60);
  }, [selectedMinutes]);
  
  // Handle duration change
  const handleDurationChange = useCallback((minutes: number) => {
    setIsActive(false);
    setMode('focus');
    setSelectedMinutes(minutes);
    setRemainingTime(minutes * 60);
  }, []);
  
  // Toggle timer active state
  const handleToggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${currentTheme.textPrimary} p-4`}>
      {/* 設定ボタン */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowSettings(true)}
          className={`p-3 rounded-lg ${currentTheme.buttonPrimary} transition-colors`}
          title="設定"
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center max-w-md w-full mx-auto">
        {/* Duration selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TIMER_PRESETS.map(preset => (
            <button
              key={preset.minutes}
              onClick={() => handleDurationChange(preset.minutes)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedMinutes === preset.minutes
                  ? `${currentTheme.accent} ${currentTheme.textPrimary}`
                  : `${currentTheme.buttonPrimary} ${currentTheme.textSecondary}`
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        {/* Mode indicator */}
        <div className="flex items-center mb-8 gap-2">
          {mode === 'focus' ? (
            <div className={`flex items-center ${currentTheme.focusColor} text-lg font-medium`}>
              <Music size={24} className="mr-2" />
              <span>Focus Session</span>
            </div>
          ) : (
            <div className={`flex items-center ${currentTheme.breakColor} text-lg font-medium`}>
              <Coffee size={24} className="mr-2" />
              <span>Break Time</span>
            </div>
          )}
        </div>
        
        {/* Circular timer */}
        <CircularTimer 
          mode={mode} 
          remainingTime={remainingTime} 
          totalDuration={getCurrentDuration()} 
        />
        
        {/* Controls */}
        <Controls 
          mode={mode} 
          isActive={isActive} 
          onReset={handleReset} 
          onToggle={handleToggle} 
        />
        
        {/* Audio controller (invisible component) */}
        <AudioController 
          mode={mode} 
          isActive={isActive} 
          onSessionComplete={handleSessionComplete}
          remainingTime={remainingTime}
          totalDuration={getCurrentDuration()}
        />
        
        {/* Modal notification */}
        <div className={`mt-8 text-center ${currentTheme.textSecondary} text-sm`}>
          <p>
            {isActive 
              ? mode === 'focus' 
                ? "Lo-fi music is playing to help you focus" 
                : "Take a break and relax" 
              : "Press Start to begin your session"}
          </p>
          {mode === 'break' && (
            <p className="mt-2">
              Break duration: {Math.floor(selectedMinutes * 0.2)} minutes
            </p>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default TimerContainer;