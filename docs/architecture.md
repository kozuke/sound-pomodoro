# Sound Pomodoro プロジェクト構成とアーキテクチャ

## ディレクトリ構成

```
/ (プロジェクトルート)
├── docs/
│   └── architecture.md        # 本ドキュメント
├── public/
│   └── audio/
│       └── .gitkeep           # 空ディレクトリ維持用
├── src/
│   ├── components/            # UI コンポーネント群
│   │   ├── AudioController.tsx  # 音声再生制御
│   │   ├── CircularTimer.tsx    # 円形タイマー表示
│   │   ├── Controls.tsx         # 開始・停止・リセット操作UI
│   │   └── TimerContainer.tsx   # タイマー全体ロジックとレイアウト
│   ├── constants/             # 定数定義
│   │   └── timer.ts            # ポモドーロ長などの設定値
│   ├── utils/                 # 汎用ユーティリティ
│   │   └── formatTime.ts       # 時間フォーマット関数
│   ├── App.tsx                # ルートコンポーネント
│   ├── main.tsx               # エントリーポイント
│   ├── index.css              # グローバルCSS（Tailwind）
│   └── vite-env.d.ts          # Vite型定義
├── index.html                 # HTML テンプレート
├── package.json               # npm依存・スクリプト
├── tailwind.config.js         # Tailwind CSS設定
├── postcss.config.js          # PostCSS設定
├── tsconfig.json              # TypeScript設定
└── vite.config.ts             # Viteビルド設定
```

## 使用技術

- フレームワーク: React + TypeScript  
- ビルドツール: Vite  
- スタイリング: Tailwind CSS + PostCSS  
- モジュールバンドリング: ES モジュール  
- 音声再生: ブラウザAudio API によるシンプル実装

## アーキテクチャ概要

1. **Entry Point**  
   - `src/main.tsx` でアプリを起動し、`<App />` をレンダー。

2. **ルートコンポーネント**  
   - `src/App.tsx` が全体のレイアウトを担当。

3. **タイマー制御**  
   - `TimerContainer.tsx` でポモドーロタイマーの状態管理（開始・停止・リセット）と残り時間を管理。
   - 時間計算やフォーマットは `formatTime.ts` を利用。

4. **UIコンポーネント**  
   - `CircularTimer.tsx` で進捗を円形グラフで表示。  
   - `Controls.tsx` で操作ボタンを提供。  
   - `AudioController.tsx` で時間切れ時や操作時の効果音を再生。

5. **設定値管理**  
   - `constants/timer.ts` にワーク・ブレイク時間などの定義を集約し、容易に調整可能。

6. **静的リソース**  
   - `public/audio/` に音声ファイルを配置し、`.gitkeep` で空フォルダを維持。

---

サンプルの変更や拡張もこの構成を踏襲することで、各責務を分離した可読性・保守性の高いプロジェクト運用ができます。

## 音源取得元
- メインループ (lofi): Pixabayのフリー音源より取得  
  - audio_1808fbf07a.mp3: https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3
- エンディングループ (lofiEnding): Pixabayのフリー音源より取得  
  - audio_2d1a6454d0.mp3: https://cdn.pixabay.com/download/audio/2022/03/10/audio_2d1a6454d0.mp3
- ベル音 (bell): Pixabayのフリー音源より取得  
  - audio_0625c6a442.mp3: https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c6a442.mp3
