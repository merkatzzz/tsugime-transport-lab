# 新本編への移行準備・読み取り専用調査

対象候補：merkatzzz/surreal-facility-adv、c1b9ed7c3cceb9e94cb2de03d9cc2986c68ffce0。別ディレクトリで読み取り専用調査。指定されたsource (5).zipは未添付で、同じ版であることは未確認。この文書は候補リポジトリの実コードに基づき、ZIPそのものとの比較完了を意味しない。

| 機能 | 旧候補の実装・依存 | 現実験との違い・再利用判断 |
| --- | --- | --- |
| 精神世界への移行 | expansion-ui.jsが侵入条件を確認し、mind.jsのcreateMindで盤面を生成、終了時にsanity・habitatを反映 | 現実験は身体カプセルとシーン切替。条件判定と結果の取引を分離して再利用し、DOMダイアログと地理座標は作り直す |
| 精神盤駆除 | mind.jsのqueueMind/mindBeat/advanceMind、予告・隣接移動・壁破壊・敵種類。expansion-config.jsのSPECIES/TUNING | 純粋な盤面更新を独立テスト可能。描画/UI、施設の停止条件、セーブ中断は新設計へ接続する |
| 正気度 | expansion-life.jsのensureExpansion、healMind、usePortable、戦闘自然減少 | 現実験は未実装。数値更新は参考になるが、上限・料金・減少量を完成仕様として移さない |
| 順応度 | life.jsのspendAdaptation/buyRecovery/rescue。時間消費ではなく行動費用型 | 現実験の生活時計とは意味が異なる。行動コスト表と復帰規則を独立させ、地下一時停止と混同しない |
| 回収 | recovery.jsのcreateRecovery/stepRecovery。流れ・加速度・抵抗・危険帯・積載・装備差、recovery-ui.js | 現実験の第23試作は簡易F/K位置合わせ。純粋な力学部分が再利用候補。品目・経済・UIの直接移植はしない |
| NPCテキスト | state.jsのnextDialogue、expansion-ui.jsのhandle/advanceConversation、npc-life.js | 現実験は既存の短い会話と所在。会話データと効果を別サービスへ切り出し、地図ノード依存は作り直す |
| 強化 | recovery.jsのgear/upgrade、expansion-life.jsのmindGear/upgradeMind | 装備強化・駆除機械強化は実在するが、希望する身体改造全般の完成を意味しない。能力フラグと資源消費の境界を新設計へ整理する |
| 所持品・金・保存 | state.jsのtsugime-workshop-v1、ensureEconomy、gold/cargo/materials、parseSave | 現実験は別スロットtsugime.transport.stage9.v1とItems、探索状態。識別子・schema・移行・数量検証を統一設計し、旧保存を直接読ませない |

旧施設のNODES/pathBetweenによる地点移動や旧搬送を、新本編の基準にはしない。新本編は新規プロジェクトとして三層＋地下、一人称、実物理搬送、故障探索を基盤に、画風・施設・UIを再設計する。ABCは実験周期であり、将来のD/E追加を妨げる完成仕様として固定しない。

旧リポジトリ、公開先、セーブは変更していない。旧コードを実験へコピー・統合せず、新本編も作成していない。指定ZIPを受領した後に版同一性と差分を追補する。
