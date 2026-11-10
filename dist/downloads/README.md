# 『継ぎ目の部屋』独立建築・搬送実験 — 第八段階

45搬送体・59基本チャンク（第七段階40体・50セルから＋5体・9セル）。独立実験の既存施設を継続し、本編・GitHub main・保存版は変更しません。主題は軽量化、個室固定壁の修正、近距離保管・近傍/現地回転、混成多セル住宅と二層の居住区EVです。

- 実験サイト：https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site
- GitHub：https://github.com/merkatzzz/tsugime-transport-lab/tree/stage8-development
- 再開ブランチ：`stage8-development`。配信元SiteのmainとGitHubのmainは別物です。
- [検証報告](docs/REPORT.md) ／ [設計・制約](docs/STAGE8.md)
- 保存第七段階：`stage7-frozen` = `835c2efe63ad0645324236a5274bbfb588d2068f`、Site保存版12。
- [第七段階の完全ソースZIP](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site/downloads/stage7-frozen-source.zip)。1686追跡ファイルをGit blobハッシュ・ZIP CRCで照合し、独立復元で121件通過。
- 同規模比較タグ：`stage8-same-size` = `d92a643`（133件）、ABC形状キャッシュ追加後の比較タグ `stage8-optimized-reference` = `b9e57b9`（134件）。どちらも40体50セル・旧搬送経路。
- 比較版 `stage1/`〜`stage7/`。6/7の比較コピーは古い入れ子・ZIPを省いたもの。完全復元の正本は固定タグ・完全ZIPです。

## 起動・検証

Node.js 22以上、Python 3。標準ライブラリと同梱Three.jsのみ、依存インストール・コンパイルは不要です。

```sh
git clone --branch stage8-development https://github.com/merkatzzz/tsugime-transport-lab.git
cd tsugime-transport-lab
npm test
npm run verify
npm run evidence
npm run package
python3 scripts/check-package.py
npm start
```

ローカルで http://localhost:8000 を開きます。file://は使いません。管理クラウドのブラウザ確認には `sites-preview start <checkout絶対パス>` を使用し、中継障害を別サーバーで迂回しません。

`verify` は現行146件と保存版1〜7、面重複・供給室12歩行・22扉掃引・第二EV候補・24条件の全体/局所CSG一致を検査します。`evidence` は18計画とABC三層図・通路グラフを出力。`package` は配布HTML・比較版・完全起動用ソースZIPを生成します。

`dist/assets/transport-plans.json` は18計画と参照歩行の事前計算データです。構造変更時は `node scripts/precompute-stage8.mjs` で再生成。前提ハッシュ不一致ならアプリは無条件再利用せず、再計画します。採用計画も実位置に対して搬送開始時に連続再検証します。

## 第七段階を非破壊で復元

既存作業ツリーのcheckout/resetではなく、別ディレクトリに展開します。

```sh
git fetch origin --tags
git worktree add --detach ../tsugime-stage7 stage7-frozen
cd ../tsugime-stage7
npm test
npm start
```

GitHubをoriginでcloneした場合も上記で復元可能。完全ZIPは新しい空ディレクトリへ展開して起動します。ZIP-only環境の再梱包には、別配布の完全保存ZIP6/7を `dist/downloads/stage6-frozen-source.zip` と `dist/downloads/stage7-frozen-source.zip` に置いてください。通常の起動・テストにGitは不要です。25MiB/asset制限のため、完全保存ZIPを現行ZIPへ入れ子にはしていません。

第七段階ZIP SHA-256：`c23864156fb462f7c42ad4bff1e7e3baadd727878b8b1d7d05b74e09538bdd92`。
保全ビルド：`/workspace/work/stage7-frozen-build.tar.gz`（41,237,102bytes、配信上限を超えるため別保存）。
SHA-256：`fedd3de0c6532466573f86210f520bb1abb3d3d4997aa51666451b0f7bed284b`。
詳細は [保全証跡](docs/evidence/stage8-preservation.json)。

第六段階タグ `stage6-frozen` = `626e4cea2fa902f367e85ecfc4e0ea519f747705` は変更しません。以前の全保存版も残します。

## 操作と新区域

- WASD 3.6m/s、Shift 5.2m/s、矢印/ドラッグ視線、Eで扉・EV・会話。搬送速度と歩行速度は独立。
- 既存のH1/H2分離・C0近道・Q1斜行点検通路・S1遠隔往復・5泉/4生物・NPC2体/R3一枚絵・自動退避・音声制御を維持。
- A：第一層M1東→G1（二連結住宅）→G2（洗濯待合）→G4（二連結折れ通路）→G3（三連結L型居間）。G3南西の居住区EVで第二層G5へ。
- B：G1はN1側、G3は第二層M1南、G5は第一層へ入替。G2は90度回転しG4へ接続。CでA配置へ戻り、C→Aでは新区域の不要搬送をしません。
- 両EV：乗場E呼出→歩いてかご奥へ→E閉扉→閉鎖完了後だけ行先メニュー→昇降→開扉。Esc/取消は同階で開扉。西側EVは三層、居住区EVは第一・第二層。
- 俯瞰＋全層で全搬送体の完全な連続移動を表示。見えない区画も物理計算からは除外しません。
- 「性能ログ保存」は実ブラウザのrAF/CPUとrenderer.infoをJSON保存します。CPU計測資料の数値はFPSではありません。

## 性能比較の再実行

`stage7-frozen`、`stage8-optimized-reference` を別worktreeへ展開し、同じ現行ハーネスを各checkoutへ順番に実行します。

```sh
node --expose-gc scripts/benchmark-stage8.mjs <比較checkout絶対パス> <結果JSON>
```

同じ1280×720/FOV54、速度8、dt0.1、三周・9遷移。WebGLレンダラー/Canvasラベルはstubです。FPS・実draw calls・GPU時間は未測定。Three.js実形状・可視候補数、CPU処理・p95/p99/最大、再生成・破棄、GC後メモリ、計画時間を記録します。CPU比較中に重い別テストを実行しないでください。

## 再開時の注意・限界

固定壁/開口規則はwall-roles/stage8-walls/architecture、描画はsurfaces/diagonal-caps/static-batches/surface-variants/view、計画はtransport-policy/transport/stage8-layout、EVはlocal-lift-*/lift/simulation/main/mapsを関連テストと一組で扱います。局所的な変更でも全18計画・形状一致・歩行を再確認してください。

管理プレビューは正確な第七段階復元でも4173中継準備タイムアウト。実WebGL目視、視点移動・操作感・実音量/ミュート/聴感は未確認。CPU試験を試遊成功として報告しません。初回ABC形状生成のピーク、キャッシュの追加メモリ、実GPU性能が次の検証課題です。EVを使う階またぎ自動退避、複数セル回転、任意連続幅のドッキングは対象外。故障・本編経済・新長編シナリオは追加していません。
