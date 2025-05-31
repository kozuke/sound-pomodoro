import { RefreshCw, Play, Pause } from 'lucide-react';
import { TimerMode } from '../constants/timer';
import { useTheme } from '../context/ThemeContext';

interface ControlsProps {
  mode: TimerMode;
  isActive: boolean;
  onReset: () => void;
  onToggle: () => void;
}

/**
 * Timer control buttons component
 */
const Controls = ({ mode, isActive, onReset, onToggle }: ControlsProps) => {
  const { currentTheme } = useTheme();

  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={onToggle}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentTheme.textPrimary} ${
          isActive 
            ? 'bg-rose-600 hover:bg-rose-700' 
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
        aria-label={isActive ? 'Pause timer' : 'Start timer'}
      >
        {isActive ? (
          <>
            <Pause size={20} />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>Start</span>
          </>
        )}
      </button>
      
      <button
        onClick={onReset}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentTheme.buttonPrimary} ${currentTheme.textPrimary}`}
        aria-label="Reset timer"
      >
        <RefreshCw size={20} />
        <span>Reset</span>
      </button>
    </div>
  );
};

export default Controls;