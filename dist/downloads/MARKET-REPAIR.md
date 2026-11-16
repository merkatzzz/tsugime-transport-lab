# 南商店街の内部構造・周期孤立の自動退避

更新：2026年11月17日。stage14-market-repair。変更前a0c328aはstage14-frozenと実行環境のstage14-frozen-source.zipに保存。ABC配置・全18搬送経路・外形・格子・SH1/SH2は変更していない。

原因はinternal-building.jsのsafeInteriorStayがsouthMarket全体を残留許可していたこと。SM0は実際には固定建築だが、A→Bで通常通路から孤立する周期運用区域である。southMarketの残留例外を外し、既存Automation.prepare/beginによる警告→通常扉の開放→経路歩行→退避完了→シャッター閉鎖→搬送を使う。恒常的な固定隔離区画へ新しい強制退避規則は追加していない。

Automation.findRouteは同じ通路成分の最寄り一点だけを残す方法を修正。安全区域の複数候補を実際の身体幅・支持床で検査し、通常歩行グリッド上の経路長で最短候補を選ぶ。直線距離を下界にして不要な探索を打ち切る。連続空間での厳密な最短経路証明ではない。

SM0は四隅を壁状設備で占めた幅2.6mの十字路。SM1は中央の壁で見通しを切り、壁の端を回って通る。SM2は南西の側面店舗へ入口を移設。SM3は扉なしの共用広場と周辺ベンチに変更。SM0/SM3の不要な通常扉を撤去し、実際に接続・分離する外周シャッターはすべて維持。内部の追加壁・設備も既存衝突機構で扱う。

[修復後の平面図](evidence/stage14-market.svg)。CのSM0→SM1→SM2→SM3→SM0、A/Bの接続も閉じた店舗扉の状態でCPU歩行検証する。SM0・SM3のA→B退避、SM2のC→A退避、安全なSM1のB→Cでは不要な退避がないことを確認する。

最終検証は[重点3件](evidence/market-repair-tests.txt)と[回帰25件](evidence/market-repair-regression.txt)が全件成功。[47扉](evidence/market-repair-doors.txt)、[ABC六条件の露出面](evidence/market-repair-seams.txt)も成功。全248件の旧結果は第14段階時点の履歴であり、今回全件を再実行した結果とはしない。搬送は同じ18経路を連続掃引・回転包絡を含め再検証し、形状からの再探索は省略した。扉の掃引と六条件の露出重複面も検査する。

PC/スマホのWebGL実画面は未確認。以前からの4173中継準備失敗とChrome初期化障害について、今回同じ無意味な再試行は行っていない。代替は実衝突判定での経路歩行、扉・接続の形状検査とSVG平面図。視覚的な印象・操作感・聴感は残件。

主な変更：south-market-layout.js（内部定義）、internal-building.js（残留例外）、automation.js（候補探索）、market-repair.test.mjs（周期退避・通路）、stage14.test.mjs（変更後の経路と安全な開始位置）、export-stage14.mjs（壁状設備の図面表示）。既存の故障・屋根歩行・A側設定は追加しない。

起動はnpm start、今回の重点検証はnode --test tests/market-repair.test.mjs。次回は個室や経路を変えた際、SM1中央の壁上をテスト開始点にしないこと。旧セーブが新しい壁内になる場合は既存の近傍安全位置復元を使う。
