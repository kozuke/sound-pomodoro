import { useState, useEffect, useCallback } from 'react';
import { Music, Coffee, Volume2, Music2 } from 'lucide-react';
import { TIMER_PRESETS, TimerMode, AUDIO_PATHS } from '../constants/timer';
import CircularTimer from './CircularTimer';
import Controls from './Controls';
import AudioController from './AudioController';

const TimerContainer = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remainingTime, setRemainingTime] = useState(selectedMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedBgm, setSelectedBgm] = useState(AUDIO_PATHS.lofi[0].id);
  const [selectedBell, setSelectedBell] = useState(AUDIO_PATHS.bell[0].id);
  
  const getCurrentDuration = useCallback(() => {
    const focusDuration = selectedMinutes * 60;
    return mode === 'focus' ? focusDuration : Math.floor(focusDuration * 0.2);
  }, [mode, selectedMinutes]);
  
  const handleSessionComplete = useCallback(() => {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    const nextDuration = nextMode === 'focus' ? selectedMinutes * 60 : Math.floor(selectedMinutes * 60 * 0.2);
    
    setMode(nextMode);
    setRemainingTime(nextDuration);
  }, [mode, selectedMinutes]);
  
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
  
  const handleReset = useCallback(() => {
    setIsActive(false);
    setMode('focus');
    setRemainingTime(selectedMinutes * 60);
  }, [selectedMinutes]);
  
  const handleDurationChange = useCallback((minutes: number) => {
    setIsActive(false);
    setMode('focus');
    setSelectedMinutes(minutes);
    setRemainingTime(minutes * 60);
  }, []);
  
  const handleToggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const selectedBgmPath = AUDIO_PATHS.lofi.find(bgm => bgm.id === selectedBgm)?.path || AUDIO_PATHS.lofi[0].path;
  const selectedBellPath = AUDIO_PATHS.bell.find(bell => bell.id === selectedBell)?.path || AUDIO_PATHS.bell[0].path;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col items-center max-w-md w-full mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TIMER_PRESETS.map(preset => (
            <button
              key={preset.minutes}
              onClick={() => handleDurationChange(preset.minutes)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedMinutes === preset.minutes
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mb-8 gap-2">
          {mode === 'focus' ? (
            <div className="flex items-center text-emerald-400 text-lg font-medium">
              <Music size={24} className="mr-2" />
              <span>Focus Session</span>
            </div>
          ) : (
            <div className="flex items-center text-blue-400 text-lg font-medium">
              <Coffee size={24} className="mr-2" />
              <span>Break Time</span>
            </div>
          )}
        </div>
        
        <CircularTimer 
          mode={mode} 
          remainingTime={remainingTime} 
          totalDuration={getCurrentDuration()} 
        />
        
        <Controls 
          mode={mode} 
          isActive={isActive} 
          onReset={handleReset} 
          onToggle={handleToggle} 
        />

        <div className="flex flex-col gap-4 mt-6 w-full max-w-xs">
          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <Music2 size={20} className="text-gray-400" />
            <select
              value={selectedBgm}
              onChange={(e) => setSelectedBgm(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            >
              {AUDIO_PATHS.lofi.map(bgm => (
                <option key={bgm.id} value={bgm.id}>{bgm.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Music size={20} className="text-gray-400" />
            <select
              value={selectedBell}
              onChange={(e) => setSelectedBell(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            >
              {AUDIO_PATHS.bell.map(bell => (
                <option key={bell.id} value={bell.id}>{bell.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <AudioController 
          mode={mode} 
          isActive={isActive} 
          onSessionComplete={handleSessionComplete}
          remainingTime={remainingTime}
          totalDuration={getCurrentDuration()}
          volume={volume}
          bgmPath={selectedBgmPath}
          bellPath={selectedBellPath}
        />
        
        <div className="mt-8 text-center text-gray-400 text-sm">
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
    </div>
  );
};

export default TimerContainer;