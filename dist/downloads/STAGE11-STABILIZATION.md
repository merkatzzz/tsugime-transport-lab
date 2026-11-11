# 第11段階 安定化修正

更新日：2026-11-12（日本時間）。

保存基準は7388b66、タグstage11-before-stabilization。作業はstage11-stabilization。以前の公開版17およびmainは保全する。

## 修正内容

- SH1/SH2の店舗は共通の六辺区画とカウンターから左右反転して生成。側壁・奥壁と横断入口を揃え、中央半廊下に柱は追加しない。既存の分離シャッター・独立搬送を再利用。
- ただし外形の着床Zは従来の1mずれを維持する。PBはz8.4〜11.4、P2はz19.3〜22.3に固定されており、SH1を北へ1m揃えるとPB、SH2を南へ1m揃えるとP2へ干渉する。店舗の局所形状は鏡写しだが、外形まで完全に同Zの鏡写しではない。この点は一部修正とし、5.6mの共通開口・0.4mの搬送離隔を維持する。
- 研究所は16×8mを維持し、開放された主研究室に補助実験室・保管室を付随させる構成へ変更。入口正面z6.5、x2.2〜9mの歩行・視界を壁で塞がない。二枚扉・独立Scene・搬送中退出禁止・B未接続/C再接続を維持。
- 研究所の退出は二枚扉全幅から2.4mで操作可能。E案内を表示し、内部退出での不要な全開掃引判定を解除。遠隔退出や未接続退出は許可しない。
- T2は1.32m横へ壁内収納するスライド扉。描画・衝突をdoorLeafの同じ座標から生成し、開口内の乗員がいる間の閉鎖を拒否。個室の開き戸は維持。
- カプセル構造は変えず、階段看板を壁の上方へ移設。訪問カメラを斜め後方へ引き、FOV68度へ調整。
- 円形水路の小型看板を平らな入口設備へ固定。水路形状は変更なし。EV表示順は第三→第二→第一層。

## 実画面の制約

管理プレビューは引き続きrelay could not open browser port 4173: timed out waiting for relay readinessで失敗し、statusはstopped。アプリはViteではなく静的配信。4173中継とWebGL無効を同じ原因とは判断しない。

所有者限定・版17を確認した既存サイトを共有Chromeで開く代替も試したが、Browser Use could not read requirementsでブラウザ基盤が失敗。追加のネイティブ入力経路で共有ChromeのURL遷移自体には成功したが、実画面はDNS address could not be found / DNS_PROBE_STARTEDで名前解決に失敗した。これはWebGL以前のネットワーク障害。継承プロキシ経由のHTTP確認もCONNECT tunnel failed, response 403で拒否された。環境側の通信許可・中継の復旧が残件であり、ゲームコード変更で解決済みとはしない。サイトを一般公開に変更せず、WebGL無効化・独自中継の設置はしない。WebGL描画・実操作・聴取・スクリーンショットはいずれも未確認。

## 検証結果

全203テスト成功（失敗0）。18搬送計画の連続検証、39扉の検査、泉への12歩行、24条件の面処理オラクル照合に成功。ABC・扉開閉6条件で露出した同法線重複面0。実WebGLの目視成功とは区別する。

[検証記録](evidence/stabilization-verification.json) ／ [全テスト](evidence/stabilization-tests.txt) ／ [着手前ソースZIP](https://tsugime-architecture-transport-lab.merkatzzz.chatgpt.site/downloads/stage11-before-stabilization-source.zip)。

## 復元

現在の作業ツリーをresetせず、別ディレクトリへgit worktree add --detach ../stage11-restored stage11-before-stabilization。保存版17のコードをそのまま起動できる。GitHubへはstage11-stabilizationのみを反映する。ソースZIPは公開サイトのdownloads/tsugime-lab-source.zip、起動はnpm test / npm start。
