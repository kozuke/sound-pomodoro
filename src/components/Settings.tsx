import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Music, Play, Pause, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { getMainBgmPath, getEndingBgmPath } from '../constants/timer';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlayingBgm {
  type: 'main' | 'ending';
  number: number;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  const { audioSettings, updateMainBgm, updateEndingBgm, updateVolume } = useAudio();
  const [playingBgm, setPlayingBgm] = useState<PlayingBgm | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // プレビュー再生を停止する関数
  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    setPlayingBgm(null);
  };

  // プレビュー再生を開始する関数
  const startPreview = (type: 'main' | 'ending', number: number) => {
    // 既に再生中の音声を停止
    stopPreview();

    const audioPath = type === 'main' ? getMainBgmPath(number) : getEndingBgmPath(number);
    const audio = new Audio(audioPath);
    audio.volume = audioSettings.volume * 0.7; // プレビューは設定音量の70%で再生
    
    audio.play()
      .then(() => {
        setPlayingBgm({ type, number });
        previewAudioRef.current = audio;
        
        // 音声終了時の処理
        audio.addEventListener('ended', stopPreview);
      })
      .catch(error => {
        console.error('Error playing preview audio:', error);
      });
  };

  // BGMボタンクリック処理
  const handleBgmClick = (type: 'main' | 'ending', number: number) => {
    const isCurrentlyPlaying = playingBgm?.type === type && playingBgm?.number === number;
    
    if (isCurrentlyPlaying) {
      stopPreview();
    } else {
      startPreview(type, number);
      // BGM設定も同時に更新
      if (type === 'main') {
        updateMainBgm(number);
      } else {
        updateEndingBgm(number);
      }
    }
  };

  // 音量変更処理
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value) / 100; // 0-100を0-1に変換
    updateVolume(volume);
    
    // スライダーの背景色を更新
    const slider = event.target;
    const percentage = (volume * 100);
    slider.style.setProperty('--value', `${percentage}%`);
  };

  // スライダーの初期背景色を設定
  useEffect(() => {
    const slider = document.querySelector('.slider') as HTMLInputElement;
    if (slider) {
      const percentage = Math.round(audioSettings.volume * 100);
      slider.style.setProperty('--value', `${percentage}%`);
    }
  }, [audioSettings.volume, isOpen]);

  // 音量設定変更時にプレビュー再生中の音楽の音量も更新
  useEffect(() => {
    if (previewAudioRef.current && !previewAudioRef.current.paused) {
      previewAudioRef.current.volume = audioSettings.volume * 0.7; // プレビューは設定音量の70%
    }
  }, [audioSettings.volume]);

  // 設定画面を閉じる時にプレビュー再生を停止
  const handleClose = () => {
    stopPreview();
    onClose();
  };

  // コンポーネントがアンマウントされる時にプレビュー再生を停止
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  // 設定画面が閉じられた時にプレビューを停止
  useEffect(() => {
    if (!isOpen) {
      stopPreview();
    }
  }, [isOpen]);

  const bgmOptions = [
    { value: 1, label: 'BGM 1' },
    { value: 2, label: 'BGM 2' },
    { value: 3, label: 'BGM 3' },
  ];

  const getBgmButtonContent = (type: 'main' | 'ending', number: number, label: string) => {
    const isSelected = type === 'main' ? audioSettings.mainBgm === number : audioSettings.endingBgm === number;
    const isPlaying = playingBgm?.type === type && playingBgm?.number === number;
    
    return (
      <div className="flex items-center justify-center gap-2">
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${currentTheme.cardBackground} ${currentTheme.textPrimary} rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Palette size={24} className="mr-2" />
            設定
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${currentTheme.buttonPrimary} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* カラーテーマ選択 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">カラーテーマ</h3>
          <div className="grid grid-cols-1 gap-3">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  currentTheme.id === theme.id
                    ? `border-blue-500 ${currentTheme.accent} ${currentTheme.textPrimary}`
                    : `border-gray-300 ${currentTheme.buttonPrimary} ${currentTheme.textSecondary}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-sm opacity-75">
                      {theme.id === 'dark' && 'ダークモード（デフォルト）'}
                      {theme.id === 'soft-blue' && '優しく上品なブルーグレー'}
                      {theme.id === 'warm-beige' && '温かみのあるベージュトーン'}
                      {theme.id === 'pastel-pink' && '可愛らしいパステルピンク'}
                      {theme.id === 'energy-orange' && 'やる気を引き出すオレンジ'}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className={`w-4 h-4 rounded-full ${theme.background.replace('bg-', 'bg-')} border border-gray-400`}></div>
                    <div className={`w-4 h-4 rounded-full ${theme.accent.replace('bg-', 'bg-')} border border-gray-400`}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* BGM設定 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Music size={20} className="mr-2" />
            BGM設定
          </h3>
          
          {/* メインBGM選択 */}
          <div className="mb-4">
            <h4 className="text-md font-medium mb-3">メインセッション BGM</h4>
            <div className="grid grid-cols-3 gap-2">
              {bgmOptions.map((option) => {
                const isSelected = audioSettings.mainBgm === option.value;
                const isPlaying = playingBgm?.type === 'main' && playingBgm?.number === option.value;
                
                return (
                  <button
                    key={`main-${option.value}`}
                    onClick={() => handleBgmClick('main', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                      isSelected
                        ? `border-blue-500 ${currentTheme.accent} ${currentTheme.textPrimary}`
                        : `border-gray-300 ${currentTheme.buttonPrimary} ${currentTheme.textSecondary}`
                    } ${isPlaying ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    {getBgmButtonContent('main', option.value, option.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* エンディングBGM選択 */}
          <div>
            <h4 className="text-md font-medium mb-3">ラストスパート BGM</h4>
            <div className="grid grid-cols-3 gap-2">
              {bgmOptions.map((option) => {
                const isSelected = audioSettings.endingBgm === option.value;
                const isPlaying = playingBgm?.type === 'ending' && playingBgm?.number === option.value;
                
                return (
                  <button
                    key={`ending-${option.value}`}
                    onClick={() => handleBgmClick('ending', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                      isSelected
                        ? `border-blue-500 ${currentTheme.accent} ${currentTheme.textPrimary}`
                        : `border-gray-300 ${currentTheme.buttonPrimary} ${currentTheme.textSecondary}`
                    } ${isPlaying ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    {getBgmButtonContent('ending', option.value, option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 音量調整 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Volume2 size={20} className="mr-2" />
            音量調整
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Volume2 size={16} className={currentTheme.textSecondary} />
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(audioSettings.volume * 100)}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className={`text-sm font-medium min-w-[3rem] ${currentTheme.textSecondary}`}>
                {Math.round(audioSettings.volume * 100)}%
              </span>
            </div>
            <p className={`text-xs ${currentTheme.textSecondary} opacity-75`}>
              音量を調整できます。変更は即座に反映されます。
            </p>
          </div>
        </div>

        {/* 操作説明 */}
        <div className={`mb-6 p-3 rounded-lg ${currentTheme.buttonPrimary} ${currentTheme.textSecondary}`}>
          <p className="text-sm">
            💡 BGMボタンをクリックして試聴できます。もう一度クリックすると停止します。
          </p>
        </div>

        {/* 閉じるボタン */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className={`px-6 py-2 rounded-lg ${currentTheme.buttonSecondary} ${currentTheme.textPrimary} transition-colors`}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 