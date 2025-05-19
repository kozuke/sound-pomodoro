import { RefreshCw, Play, Pause } from 'lucide-react';
import { TimerMode } from '../constants/timer';

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
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={onToggle}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
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
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all duration-200"
        aria-label="Reset timer"
      >
        <RefreshCw size={20} />
        <span>Reset</span>
      </button>
    </div>
  );
};

export default Controls;