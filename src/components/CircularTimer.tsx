import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TimerMode } from '../constants/timer';
import { formatTime } from '../utils/formatTime';
import { useTheme } from '../context/ThemeContext';

interface CircularTimerProps {
  mode: TimerMode;
  remainingTime: number;
  totalDuration: number;
}

/**
 * Circular progress visualization component for the timer
 */
const CircularTimer = ({ mode, remainingTime, totalDuration }: CircularTimerProps) => {
  const { currentTheme } = useTheme();
  
  // Calculate progress percentage
  const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
  
  // Determine colors based on current mode and theme
  const getPathColor = () => {
    if (mode === 'focus') {
      if (currentTheme.focusColor.includes('emerald')) return '#34d399';
      if (currentTheme.focusColor.includes('sky')) return '#0ea5e9';
      if (currentTheme.focusColor.includes('amber')) return '#f59e0b';
      if (currentTheme.focusColor.includes('pink')) return '#ec4899';
      if (currentTheme.focusColor.includes('orange')) return '#fb923c';
      return '#34d399'; // default
    } else {
      if (currentTheme.breakColor.includes('blue')) return '#60a5fa';
      if (currentTheme.breakColor.includes('indigo')) return '#6366f1';
      if (currentTheme.breakColor.includes('orange')) return '#fb923c';
      if (currentTheme.breakColor.includes('purple')) return '#a855f7';
      if (currentTheme.breakColor.includes('red')) return '#f87171';
      return '#60a5fa'; // default
    }
  };

  const pathColor = getPathColor();
  const textColor = currentTheme.textPrimary.includes('white') || currentTheme.textPrimary.includes('50') ? '#ffffff' : 
                   currentTheme.textPrimary.includes('900') || currentTheme.textPrimary.includes('800') ? '#111827' : '#ffffff';
  
  return (
    <div className="w-64 h-64 md:w-80 md:h-80">
      <CircularProgressbar
        value={progress}
        text={formatTime(remainingTime)}
        styles={buildStyles({
          // Colors
          pathColor,
          textColor,
          trailColor: currentTheme.textPrimary.includes('white') || currentTheme.textPrimary.includes('50') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          
          // Text size
          textSize: '16px',
          
          // Rotation
          rotation: 0,
          
          // Transition
          pathTransition: 'stroke-dashoffset 0.5s ease 0s',
        })}
      />
    </div>
  );
};

export default CircularTimer;