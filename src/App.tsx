import React from 'react';
import TimerContainer from './components/TimerContainer';
import { useTheme } from './context/ThemeContext';

function App() {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <TimerContainer />
    </div>
  );
}

export default App;