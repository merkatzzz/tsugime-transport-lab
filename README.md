# 『継ぎ目の部屋』独立建築・搬送実験 — 第九段階

47搬送体・64基本チャンク。第八段階の三層・完全物理搬送・二EV・描画cacheを維持し、2人の住民の生活、3D個室訪問、店舗遮蔽、所持品/使用と保存を追加しました。本編とは別の実験です。

- 実験サイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site
- 再開ブランチ：`stage9-development`（GitHub main・本編は変更しない）。
- [検証報告](docs/REPORT.md) ／ [設計・制約](docs/STAGE9.md)
- 第八段階正本：`stage8-frozen` = `159673a79b1dd6a18b149d2e0bb95d16792c257a`、Site保存版13。
- [完全保存ZIP](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site/downloads/stage8-frozen-source.zip)：2020追跡ファイル・Git blobハッシュ/ZIP CRC照合済み。復元先で146テスト通過。SHA-256 `80a5de7eb4d7bdf2d35c9f43527fd4f735436bf4e2ec1fad73d31e61d6c3f1bd`。
- 実ビルドは `/workspace/work/stage8-frozen-build.tar.gz` に別保存。59,045,122bytes、SHA-256 `151cfa1b5058766ce0d7383ea8a5940c7c2fb8a66c1dcb45b3a4dba0d53ac15d`。Site13も残す。
- 比較用 `stage1/`〜`stage8/`。6以降は旧版の入れ子/ZIPを省いた比較コピー。完全復元は固定タグまたは完全ZIPを使う。

## 起動・検証

Node.js 22以上とPython 3。Three.js同梱、外部依存の追加インストール不要。

```sh
git clone --branch stage9-development https://github.com/merkatzzz/tsugime-transport-lab.git
cd tsugime-transport-lab
npm test
npm run verify
npm run evidence
npm run package
python3 scripts/check-package.py
npm start
```

ローカルは http://localhost:8000 。file://は使用しない。管理クラウドのQAは `sites-preview start <checkout絶対パス>` のみ。4173中継準備タイムアウトのため実WebGLは未確認で、別サーバーで迂回していません。

`verify` は現行・保存版1〜8と面重複/供給室12歩行/扉掃引/EV/24条件CSG一致を再実行（数分以上）。`evidence` は18計画とABC三層図を出力します。構成変更時は `node scripts/precompute-stage8.mjs` で現在構成の18計画・歩行テンプレートを再生成。命名は互換維持で、前提ハッシュが不一致ならアプリは再計算します。

再梱包では別配布の完全ZIP6・7・8を `dist/downloads/stageN-frozen-source.zip` へ置くか、Gitタグから再生成してください。25MiB/asset制限のため現行ZIPへ旧完全ZIPを入れ子にはしません。起動・テストにGitは不要です。

## 第八段階へ非破壊で戻す

```sh
git fetch origin --tags
git worktree add --detach ../tsugime-stage8 stage8-frozen
cd ../tsugime-stage8
npm test
npm start
```

現行作業ツリーをreset/checkoutで潰しません。ZIPは別の空ディレクトリへ展開。保存タグ1〜7・既存本編も変更しません。

## 操作と試験場所

- WASD 3.6m/s、Shift 5.2m/s、ドラッグ/矢印で視線、Eまたは近距離クリックで扉/会話。
- 生活時計は搬送倍率と独立。店主は0〜15秒にP9住戸、15〜60秒にT1。住人は8秒ずらし、R3↔T2。名目在室15/勤務45秒。会話/訪問/取引・遮蔽・観察で所在確定を保留できます。
- R3の住人扉、P9の住戸901：在室時は同じ施設の3D固定視点へ。不在時は画面下に次の在室時刻。訪問中は「話しかける」、終了はS/「廊下へ戻る」。旧SVGは保存版に残し、現行訪問には重ねません。
- T1は布カーテン、T2は金属営業シャッター。開店後は近くで会話/取引。閉店後の新取引は不可、進行中の取引は完了可。店内にいるときや俯瞰で観察中はワープを保留します。
- 「仮の届け物を受け取る」→「所持品」で閲覧→「品物を使う」で品と対象を選択。店主へ正しく渡せば一度だけ消費。扉/別NPCへの誤使用は消費しません。店主在室中の訪問でも手渡せます。
- 「保存/読込」はブラウザ内の専用slot。搬送・EV移動中は保存不可、完了後に保存。時計・NPC所在・遮蔽物・訪問/会話/取引・品物・使用結果・ABC配置を復元します。
- 新施設：第二層G5東（A/C）またはG3東（B）→J9単独廊下→P9四連結共同棟。北側2室と南側の一続きの共用室を持ち、P9はBで0.4mのドック整列、Cで復帰します。
- 既存H1/H2・C0/Q1・N4/G2回転・S1遠隔往復・泉/生物・両EV・自動退避は維持。全層俯瞰で完全な物理搬送を表示できます。

## 保存互換性と再開注意

独立実験の旧ソースには本編の所持品/回収売却・順応度・永続セーブは存在しません。新しい `tsugime.transport.stage9.v1` だけを書き、他slotを消さず、本編から移植しません。通常使用品と回収試料をkindで区別。未知の品IDは保持し、schema0の単純inventoryを取り込めるAPIを設けています。任意の本編セーブの互換性を保証するものではありません。

life.jsが所在の唯一の情報源、life-viewが各NPCを一つだけ生成/付替。items/save-life/experience/mainと関連テストを一組で評価してください。営業用パネルは移動用shuttersと独立し、固定壁・物理経路・cacheの削除で負荷を逃がしません。

見た目の自然さ、実FPS・操作感・聴感は未確認。CPUの実形状・光線・保存・操作・搬送試験と区別します。所持品美術・経済・故障・長編イベント・徒歩通勤・多数の鍵・盗難は追加していません。
