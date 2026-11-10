# 『継ぎ目の部屋』独立建築・搬送実験 — 第七段階

40搬送体・50基本チャンクの三層施設。本編とは未統合です。第六段階の遠隔往復、泉・生物、90度回転、H1/H2分割広間、C0近道、NPC・個室画像・音声を維持し、中央・南側の住宅、可変接続壁、二連結点検廊下、内開き扉、EV操作を改修しました。

- 実験サイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site
- GitHub：https://github.com/merkatzzz/tsugime-transport-lab/tree/stage7-development
- 再開ブランチ：`stage7-development`。GitHubの`main`と本編は変更しません。
- [検証報告](docs/REPORT.md) ／ [設計・配置・制約](docs/STAGE7.md)
- 第六段階固定タグ：`stage6-frozen` = `626e4cea2fa902f367e85ecfc4e0ea519f747705`
- [第六段階完全ソースZIP](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site/downloads/stage6-frozen-source.zip)：タグの全追跡ファイル。素材・仕様・テスト・hosting設定を含みます。
- 比較版：`stage1/`〜`stage6/`。比較用stage6は旧比較版の入れ子・ZIPを省いたコピー。完全復元には固定タグまたは完全ZIPを使います。

## 起動と検証

Node.js 22以上、Python 3の標準ライブラリのみ。Three.jsは同梱。追加依存インストール・コンパイルは不要です。

```sh
git clone --branch stage7-development https://github.com/merkatzzz/tsugime-transport-lab.git
cd tsugime-transport-lab
npm test
npm run verify
npm run evidence
npm run package
npm start
```

ローカルで http://localhost:8000 を開きます。`file://`は使いません。管理クラウドでは `sites-preview start <checkout絶対パス>` のみを使用し、中継障害を別サーバーで迂回しません。

`verify`は現行と保存版1〜6、面重複・供給室歩行・第二EV候補を検査。`evidence`は18搬送計画、三層ABC図・接続グラフ・変更データを生成。`package`はHTML報告、比較版、起動・テストに必要なソースZIPを生成します。配信上限25MiBのため、第六段階完全ZIPを現行ZIPへ重複内包せず別配布します。ZIP展開からの起動・テストにGitは不要ですが、配布物を再生成する場合は固定Gitタグ、または別配布の完全ZIPを `dist/downloads/stage6-frozen-source.zip` に置いてから実行してください。

## 第六段階を壊さず復元する

```sh
git fetch origin --tags
git worktree add --detach ../tsugime-stage6 stage6-frozen
cd ../tsugime-stage6
npm test
npm start
```

元の第七段階作業ツリーは変更しません。ZIPの場合は新しい空ディレクトリへ展開して同じ手順を実行。固定タグの実展開で106テスト通過、ZIP整合性検証済み。管理プレビューは旧版も中継4173の準備待ちで失敗したため、GPU起動成功とは報告しません。第六段階のサイト保存版10も残しています。

完全ソースZIP SHA-256：`d0ea064c1a4dae1a5bc9fbfabea734545dff506d1d49a9c15741ca31020416f5`。

第六段階ビルドTARも別途保存。SHA-256：`19d10d9d2e6e1ff1faea2af227cfe93a0c111df2929fa956132adc4386e7b2bb`。構成・再現証跡は `docs/evidence/stage7-preservation.json`。

## 変更を部分的に取り込む場合

原則は `stage7-development` 全体から再開。部分取り込みは新しい検証用ブランチで `git diff stage6-frozen..stage7-development -- <対象ファイル群>` を確認してから行い、現用ファイルを初期化しません。

- EV：`lift.js`、simulation/main/view、HTML/CSS、EVテストを一緒に評価。旧 `useLift(階)` APIとは互換ではありません。
- 可変壁：adaptive-portals/portal-state、architecture/simulation/view、stage7-layoutが一組。
- 建築・搬送：stage7-layout/architecture/transport/infrastructure、地図・生物描画・テストが連動。
- 内開き扉：doors/experience、衝突・ナビゲーション・描画を一緒に評価。

部分取り込み後も `npm run verify` を必須にします。個別ファイルだけの成立は保証しません。保存版ディレクトリ・固定タグは編集しません。

## 操作・試遊箇所

- WASD歩行3.6m/s、Shift高速5.2m/s、矢印回転、ドラッグ視線、E扉・設備・会話。
- 周期A：第一層U5南から3チャンクL型住宅V1、第二層L1南から2チャンク住宅V2、第三層南側V3・共用玄関A3へ。同階EV乗場から実歩行できます。
- 周期B：V1が南、V2が第三層、V3が第一層へ移動。二連結廊下Q1が挿入され、K1→V3→Q1→旧設備室W1、Q1→V1の経路が成立。Q1には実際の斜行区間があります。
- 一体搬送V1/V2/Q1の内部に搬送用シャッターはありません。H1/H2の分割型と混在。
- EV：乗場でE呼出→歩いてかごへ→内部でE閉扉→閉鎖後の文字メニューで階をクリック→昇降→着床開扉。現在階は選べず、キャンセルは同階で開扉。
- 遠隔D1〜D4はS1で往復。帰還時は8実秒の予告と残り4秒の再告知後、必要なら実経路でS1へ退避。倍率8でも予告は短縮しません。
- 泉は5基のまま。N1/P1を第一層中央寄り、N3/P3を第三層南へ再配置。N4回転とPA/PB接続は維持。
- NPC会話・R3一枚絵・自動運行・区画別孤立例外・音量/ミュートは維持。デバッグ復帰・条件リセットは通常移動ではありません。

## 確認限界

管理プレビュー中継障害により、実WebGL、視点移動時のチラつき、構図・操作感、音量・聴感は未確認。CPUの実メッシュ・光線・衝突・身体移動テストを目視確認と混同しません。

第二中央EVは候補3地点と既存配置・掃引の競合から見送り。全候補不可能という意味ではなく別途局所再設計が必要です。EVを使う階またぎ自動退避は未実装で、実経路がなければ安全停止。旧型生物・秘密区域・泉の由来・本編経済・戦闘は対象外です。
