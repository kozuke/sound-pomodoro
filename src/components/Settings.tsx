import React from 'react';
import { X, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${currentTheme.cardBackground} ${currentTheme.textPrimary} rounded-lg shadow-xl max-w-md w-full p-6`}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Palette size={24} className="mr-2" />
            設定
          </h2>
          <button
            onClick={onClose}
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

        {/* 閉じるボタン */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
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