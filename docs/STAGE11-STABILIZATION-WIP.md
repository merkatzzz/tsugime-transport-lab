# 第11段階追加修正：作業中・未公開

基準コミット7388b6637d37e8008530ac586d2417c4707f7a2cをstage11-before-stabilizationタグに保全。作業ブランチstage11-stabilization。公開版17は変更していない。

実装した変更（実画面未確認）：カプセル階段看板を南側壁上方へ移動、訪問カメラを斜め後方へ引きFOV68度、研究所二枚扉全幅から2.4mの退出判定とE案内、退出時の不要な扉掃引拒否の緩和、円形水路入口の平らな取付部に小型看板、EV表示順を第三→第二→第一層へ変更。上階構造・搬送座標は変更していない。

未実装：SH1/SH2の鏡写し店舗再設計、研究所の大きい主室と補助室への改築・入口周辺再調整、T2等の横スライド扉。これらは次の実装対象であり、完了していない。

管理プレビューはsites-preview startでrelay could not open browser port 4173: timed out waiting for relay readiness。statusはstopped。ssの待受一覧に4173なし、HTTPは000。独自サーバーへの置換や権限変更はしていない。現在の起動方式はViteでなくhosting.jsonのdist静的配信で、Vite設定の不備を原因と断定できない。

代替として所有者限定・保存版17であることをSites APIで確認した既存URLを共有Chromeで開こうとしたが、Browser Use could not read requirementsでブラウザ操作基盤が失敗。接続成功・WebGL描画・操作・聴取のいずれも確認済みとはしない。アクセス範囲の変更なし。

この状態は修正の途中であり、完成版として公開・配布してはいけない。残りの実装、全体回帰、実画面確認、証拠更新、ZIP再梱包を終えてから公開する。
