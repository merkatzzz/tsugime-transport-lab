# 吹き抜け改善・独立連結大部屋（第13段階・検証候補）

stage13-development。60搬送体・89チャンク。住戸間へ広げた40.8㎡の三段吹き抜け、細い透明柵、後退した接続部材、階段下と東側への収納、BR1の一チャンク一室、BR2/BR3の独立搬送で形成する大部屋を実装しています。

[今回の設計・操作・図面・検証区分](docs/STAGE13.md) ／ [未確認項目の継続管理](docs/OPEN-ISSUES.md)。実WebGLは今回も基盤障害で未確認です。既存57搬送体のABC完成位置、SH1/SH2、AC1勾配、生活と研究所の入退室を維持しています。

Node 22以上とPython 3。npm test、npm start（8000番）、npm run verify。依存追加・ビルド不要。大部屋は居住区EV→G5→J9南口→BR1→BR3→BR2。A/Cで広間、Bで独立します。吹き抜けはA/CにAT0へ入り、Bで上下探索、Cで外部へ退出します。

直前の610cc34はstage12-repair-frozen、Sites保存版20で保全。以下は過去の記録です。

# 第12段階 修復候補

作業ブランチ stage12-repair。商業街路を南側へ再配置し、P9共用通路から直接入る平面へ再設計。AC1をAT0の共用ホールへ接続し、身体の高さによる衝突判定と、Bで100%表示のまま階段が止まる不具合を修復しました。

[修復報告・図面・検証区分](docs/STAGE12-REPAIR.md) ／ [未完項目の継続管理](docs/OPEN-ISSUES.md)。実WebGL表示・人間の一人称操作は基盤障害のため未完です。CPU上の入力歩行と混同せず、修復候補として扱います。旧版19f08e1は stage12-before-repair とSites保存版19で保全しています。

以下は修復前の履歴です。現在の状態は上記資料を優先してください。

# 第12段階：共同商業廊下・三段吹き抜け

stage12-development。57搬送体・86チャンク。SH1/SH2の店舗を通らない街路入口、Bで接続する12チャンクの吹き抜け住宅、床・天井収納、二段透明柵、独立搬送する中間段、通常歩行の二つの40段階段を実装しました。

[第12段階の設計・検証・操作・保存と制約](docs/STAGE12.md)。A/Cで第二層P9東の新開口→AC1→AT0へ入り、Bへ同乗。Bで階段を上下し、AT0へ下りてCで外部へ戻ります。開閉が止まったら中央収納帯・上部階段から固定床へ歩いて離れてください。俯瞰の注目区域と専用三段地図を使えます。

Node 22+ / Python 3。npm test、npm start、npm run verify。ビルド・追加依存は不要。WebGL実画面は4173中継障害のため未確認。以前の安定版は stage11-stabilization-frozen = bddf4df で保全しています。

以下は旧版の履歴です。現在の状態は上記の第12段階資料を優先します。

# 第11段階 安定化修正

作業ブランチ stage11-stabilization。[修正内容・未確認項目・復元](docs/STAGE11-STABILIZATION.md)。共同店舗の鏡像生成、T2スライド扉、主室型研究所、入退室・看板・カメラ・EV順序を調整。固定泉との干渉を避け、共同廊下の外形1mずれは維持しています。WebGL目視・聴感はブラウザ基盤障害のため未確認。

以下は版17の説明（安定化差分は上記資料を優先）。

# 『継ぎ目の部屋』独立建築・搬送実験 — 第十一段階

再開は `stage11-development`。53可動設備・72チャンク（実搬送32／待機21）、固定設備10。廊下沿い六室の二連結住宅、複合小店舗、一組の分離共有街路、内部二階建てカプセル棟、独立Sceneの自由探索研究所を追加。旧47体のABC完成座標と既存機構は維持しました。

[設計・操作・復元・制約](docs/STAGE11.md) ／ [検証報告](docs/REPORT.md) ／ [CPU性能と測定限界](docs/PERFORMANCE-STAGE11.md) ／ [全53体の実経路・接続](docs/evidence/stage11-facility-audit.json)。独立実験であり本編ではありません。新NPC・アイテム・経済は追加していません。

着手前の正本は `stage10-redesign-frozen` = `1fb5db3e8e1b907efc69d34af028c67e4c488732`。復元worktreeで旧182テスト通過。完全ZIPとSite16を残し、比較配信は `stage10-redesign/`。GitHub mainや旧開発ブランチは変更しません。

Node 22+／Python 3、依存の追加インストール・ビルド不要。`npm test`、`npm start` で http://localhost:8000 。再生成は `npm run precompute` → `npm run evidence` → `npm run package`、配布チェックは `python3 scripts/check-package.py`。`npm run verify` は全テスト・18計画・面処理・扉・歩行・図面の一括検証で数分かかります。

ZIPには正本ソースと比較元を含み、再生成可能な `dist/stage*/`・`dist/downloads/` を重複収録しません。再梱包時は旧完全ZIP6〜10/redesignも別ダウンロードして配置するか、保存タグのあるGit cloneを使います。起動・テストにはGitや旧ZIPは不要です。

A/C：第三層U2南→RH1（六室）、東→CP1、南→MK1。CP1東側階段を北へ上ると内部+3m、201/202扉で既存モデルの構図試験。第二層U4東→SH1↔SH2→LB1研究所。二枚扉でE、内部はWASD/Shiftで探索。BはSH2が第三層の住宅入口へ移り、研究所は未接続で退出禁止。内部ボタンでCへ再接続してから入口へ戻ります。

サイト： https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site （従来の所有者限定）。実WebGLと聴感は、管理プレビューの4173中継準備タイムアウトにより未確認です。CPUの実形状・移動・描画呼出先の検査を目視済みとは扱いません。

以下は着手前までの履歴です。旧ブランチ・件数・性能・仕様は当時の情報です。

# 『継ぎ目の部屋』独立建築・搬送実験 — 第十段階・搬送再設計版

再開ブランチ：stage10-redesign。47可動設備・64チャンク、固定設備10。全体のABC設計と診断を集約し、J9/U2を搬送対象へ、P9をBで第一層へ移します。G1/M1のC配置、南の実退避、室内部分壁、水路断面、店舗高と店主の向きも修正しました。

[修正版の報告・操作・復元方法](docs/STAGE10-REDESIGN.md) ／ [全47体の比較表](docs/TRANSPORT-COMPARISON.md) ／ [今後の増築ルール](docs/FACILITY-DESIGN.md)。npm test、npm run verify、npm run audit、npm start。サイトの右側「搬送診断」でABCと固定/待機の理由を確認できます。

改修前はstage10-frozen（6ec6640）と完全ZIPで保存。現在のサイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site 。WebGL目視・聴取は管理プレビューの4173中継障害により未確認です。

以下は旧第十段階までの記録です。旧配置・保存版・再開ブランチ・性能値は当時の情報として参照してください。

# 『継ぎ目の部屋』独立建築・搬送実験 — 第十段階

固定水路3か所、東南各8.4mの搬送域拡張、店舗カウンター、NPC手動指定と訪問扉修正を実装。47搬送体・64可動チャンクと8×8×6mを維持。

再開ブランチは stage10-development。第九段階は stage9-frozen（24d1881）と完全ZIPで保存しています。npm test で自動検証、npm start で localhost:8000 を開きます。ビルド不要の同梱Three.js構成です。

[第十段階報告・復元・検証制約](docs/STAGE10.md) ／ [サイト](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site) ／ [ソースZIP](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site/downloads/tsugime-lab-source.zip)。実WebGL・聴感は4173中継障害により未確認。

以下は第九段階の引き継ぎ・操作資料です。旧性能値・保存版番号・再開ブランチは当時の記録として参照してください。

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
