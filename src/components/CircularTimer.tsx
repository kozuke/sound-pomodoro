import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TimerMode } from '../constants/timer';
import { formatTime } from '../utils/formatTime';

interface CircularTimerProps {
  mode: TimerMode;
  remainingTime: number;
  totalDuration: number;
}

/**
 * Circular progress visualization component for the timer
 */
const CircularTimer = ({ mode, remainingTime, totalDuration }: CircularTimerProps) => {
  // Calculate progress percentage
  const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
  
  // Determine colors based on current mode
  const pathColor = mode === 'focus' ? '#34d399' : '#60a5fa';
  const textColor = '#ffffff';
  
  return (
    <div className="w-64 h-64 md:w-80 md:h-80">
      <CircularProgressbar
        value={progress}
        text={formatTime(remainingTime)}
        styles={buildStyles({
          // Colors
          pathColor,
          textColor,
          trailColor: 'rgba(255, 255, 255, 0.1)',
          
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