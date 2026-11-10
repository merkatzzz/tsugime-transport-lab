# 『継ぎ目の部屋』独立建築・搬送実験 — 第五段階

20搬送体・26チャンクの三層施設。第三・第四段階の密集建築、東翼、可動廊下C0の近道、NPC・会話・個室画像・音声を維持し、広間の分割搬送、自動運行と実経路退避、第一層、短い入室演出を追加しています。本編とは別の独立実験です。

- 実験サイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site
- GitHub：https://github.com/merkatzzz/tsugime-transport-lab/tree/stage5-development
- 開発ブランチ：`stage5-development`（GitHubの`main`は更新していません）
- 詳細：[第五段階の仕様・実装と制約](docs/STAGE5.md)、[検証報告](docs/REPORT.md)
- ソース一式：サイトの「ソースZIP」、または上記GitHubブランチのCode → Download ZIP
- 第四段階保存：`stage4/`、タグ`stage4-baseline`、コミット`dcebd2f0fb94a8df590ecb5ca4e74de697f97b6b`
- 比較ルート：`stage4/index.html`、`stage3/index.html`、`stage2/index.html`、`stage1/index.html`

## 起動と検証

Node.js 22以上、Python 3の標準ライブラリのみ。Three.jsは`dist/vendor/`に同梱。依存追加やnpm installは不要です。

```sh
git clone --branch stage5-development https://github.com/merkatzzz/tsugime-transport-lab.git
cd tsugime-transport-lab
npm test
npm run verify
npm run evidence
npm run package
npm start
```

ローカルでは http://localhost:8000 を開きます。`file://`は使わないでください。管理クラウドの画面確認には指定の`sites-preview start <checkout絶対パス>`のみを使い、別サーバーやポートで中継障害を迂回しないでください。

`verify`は第五段階と保存版1〜4のテスト、面重複検査を行い、結果を`docs/evidence/test-summary.json`へ生成します。`evidence`は18搬送計画・三層図面・近道測定を更新。`package`はHTML報告、旧版比較ルート、自己完結ソースZIPを生成します。静的サイトなのでコンパイル工程はありません。公開用は`.openai/hosting.json`の既存Sites識別子を保持してください。

## 操作

- 搬送俯瞰：ドラッグ回転、ホイール拡縮、階切断。三層地図と搬送デッキ図を比較できます。
- 3D探索：WASDで3.6m/s、Shiftで5.2m/s、矢印回転、ドラッグ視線。
- E：通常扉・近くのNPC・EV。扉は0.65秒で開閉し、開放完了まで衝突します。
- 固定EV：乗場で呼び、かごの奥で行先を選び操作ボタン。Eだけなら三層を順に巡回。
- R3個室：廊下側から扉を操作して画像へ。会話ボタン/Eで話す。S/退出ボタンで元の身体ローカル位置・視線へ戻ります。
- 入室演出：初期0.14秒、UIで0.10〜0.18秒へ調整。退出0.08秒。動きを減らすOS設定にも対応。
- 自動搬送：初期OFF、待機40秒、5〜600秒調整。警告→必要な実経路退避→閉鎖→搬送→開放。
- 孤立例外：現在の内部区画だけ許可・解除。次の物理搬送で再接続を要求するボタンを用意。
- 音声：ユーザー操作で開始、音量・ミュート。デバッグ復帰は通常の退避とは別の座標初期化です。

## 三層と広間

第一層−12.8m、下部デッキ−6.4m、第二層0m、上部デッキ+6.4m、第三層+12.8m。既存の第二・第三層の配列番号と名称を入れ替えていません。

H1/H2は各16×8mの独立2チャンク。A/Cで幅14mの境界を開放し、Bで別の場所へ分離します。24分割の折り畳み仕切り・床継手は搬送前に閉鎖・格納します。第一層のK1は小居室、K2は交差通路、M1は第一層と第二層を移動する交流室です。

## 検証上の注意

CPUの衝突、身体移動、実Three.jsメッシュ、面検査と、実ブラウザのGPU描画・聴感は別です。今回の管理プレビューは中継ポート4173準備待ちで失敗しました。WebGLでの視点移動・外観・演出・操作感・実音量は未確認です。自動退避に実経路がない場合は明示的な安全停止とし、座標ワープで成功扱いにしません。階をまたぐEV自動退避は未実装です。
