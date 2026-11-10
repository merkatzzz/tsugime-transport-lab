# 『継ぎ目の部屋』独立建築・搬送実験 — 第六段階

34搬送体・40基本チャンクの三層施設。第五段階までの密集建築、H1/H2分割広間、C0近道、上下搬送、自動運行・実経路退避、NPC・個室画像・環境音を維持し、遠隔区域への往復、固定泉5基、新型中和生物4体、90度回転搬送を追加しました。本編とは未統合です。

- 実験サイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site
- GitHub：https://github.com/merkatzzz/tsugime-transport-lab/tree/stage6-development
- 再開ブランチ：`stage6-development`。GitHubの`main`は変更しません。
- [第六段階の設計・配置・判定・制約](docs/STAGE6.md) ／ [検証報告](docs/REPORT.md)
- ソース一式：サイトのソースZIP、または上記GitHubブランチのCode → Download ZIP
- 第五段階完全保存：`stage5-baseline` = `6dc2039eb030e6b0a946d3f83141cf1db8e4921c`
- 保存版1〜5：`stage1/`〜`stage5/`。公開比較先も同名ルートです。

## 起動と検証

Node.js 22以上、Python 3の標準ライブラリのみ。Three.jsは同梱。追加依存のインストールは不要です。

```sh
git clone --branch stage6-development https://github.com/merkatzzz/tsugime-transport-lab.git
cd tsugime-transport-lab
npm test
npm run verify
npm run evidence
npm run package
npm start
```

ローカルで http://localhost:8000 を開きます。`file://`は使用しません。管理クラウドのブラウザ確認は指定の`sites-preview start <checkout絶対パス>`を使用し、別サーバーで中継障害を迂回しません。

`verify`は現行と保存版1〜5、面重複検査を実行し、`docs/evidence/test-summary.json`と各テストログを生成。`evidence`は全18搬送計画、三層図、接続成分図、泉・生物、遠隔区域・回転経路を出力。`package`はHTML報告、比較版、自己完結ソースZIPを生成します。静的サイトのためコンパイルはありません。

## 操作と試遊経路

- WASD移動3.6m/s、Shift高速5.2m/s、矢印回転、ドラッグ視線、E扉・設備・会話。
- 第三層東翼E2/E4の南口からS1へ入り、A→Bを開始すると遠隔区域D1〜D4へ同乗移動。探索後はS1でB→C帰還。残った場合は実経路でS1へ退避します。
- N1〜N4の壁面生物に近づいてE。泉全体の中和後、供給器官を利用できます。毒性のある間は供給を拒否します。
- BN4のN4は回転ベイで90度回り、第三層PA→第二層PBへ接続。俯瞰注目を「回転ベイ」にすると観察できます。
- 平面図は生活区域・遠隔区域・全域を切替。俯瞰注目切替はカメラだけを動かし、主人公は移動しません。
- EVは乗場でE呼出、歩いて入室、行先を選択してEまたは操作ボタン、着床後に歩いて退出。現在・選択・移動先を表示します。
- R3個室は廊下から扉を操作。会話と画像滞在は別、Sまたは退出ボタンで元の位置・視線へ。入室0.14秒、退出0.12秒の柔らかい中央明転です。
- 自動運行初期OFF、待機40秒、5〜600秒調整。区画別の孤立例外と物理再接続要求を維持。デバッグ復帰は通常の退避ではありません。
- 音声はユーザー操作で開始。音量・ミュートを維持しています。

## 検証の限界

管理プレビューは今回も中継ポート4173の準備待ちで失敗。実WebGL画面・GPU上のチラつき・構図・操作感・聴感は未確認です。CPUのThree.jsメッシュ・衝突・実移動試験の通過を、目視確認としては扱いません。EVを使う階またぎ自動退避は未実装で、実経路がなければ安全停止します。

A側旧型生物、秘密区域、泉の発生源、本編の経済・戦闘などは追加していません。第五段階の詳細は[保存資料](docs/STAGE5.md)、完全復元には保存タグを使用してください。
