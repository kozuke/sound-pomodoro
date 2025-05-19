/**
 * Formats seconds into a MM:SS string
 * @param seconds - Number of seconds to format
 * @returns Formatted time string (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};