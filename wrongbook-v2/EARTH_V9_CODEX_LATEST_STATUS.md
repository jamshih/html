# EARTH V9 — LATEST STRICT QA STATUS FOR CODEX

This file supplements `EARTH_V9_CODEX_HANDOFF.md` with the newest completed strict run.

## Current implementation state

- Implementation commit tested: `163e7b725b4d14d38206377071ed66f2f94c7ac9`
- Strict gate run: `31949444144`
- Workflow: `Earth Source Hierarchy V9 Temp Gate`
- Result: `failure` only because residual strict geometry defects remain
- Artifact: `earth-source-hierarchy-v9-proof`
- Canonical architecture remains intact; no micro-font, duplicateOwnership, or wrongParent failures reported in this run.

## Fully clean in BOTH Recall + Learn

- p242
- p245
- p251
- p252

These should be treated as regression-locked. Do not change them unless a later regression proves necessary.

## p243

Recall: 5 total defects

- textText: `……` vs `3`
- textConnector: `各時期代表化石` vs one relative-age connector
- clippedText: q39 `個半衰期`
- overflowedText: q38 `%`
- overflowedText: q39 `個半衰期`

Learn: 6 total defects

- all Recall defects above
- plus `白堊紀末大滅絕` vs `(46)`

Likely next edit area: `earth-source-trace-p243-true-v6.css` / source connector route. Do not break Q48 composite / printed Q49 behavior.

## p244

Recall: 3 defects
Learn: 3 defects

Same set in both modes:

- connector crossing `受兩因素影響`
- q6 suffix overflow: `² 成反比`
- q21 suffix overflow: `ly`

These are local geometry/width issues. No ownership problem.

## p246

Recall: 2 defects

- `小時` vs `(12)`
- q12 container-child: `度`

Learn: 4 defects

- `小時` vs `(12)`
- `第2日` vs `24:00`
- q12 container-child: `30`
- q12 container-child: `度`

Annual panel is structurally owned correctly now; remaining work is local band spacing/contentRect refinement.

## p247

The large duplicate-owner cleanup worked: p247 dropped dramatically from the previous 15+ text collisions.

Recall: 7 defects

- `轉軸指向` vs `天球北極`
- `轉軸指向` vs `天球南極`
- `春、秋分＝` vs `周日運動的軌跡必與轉軸`
- q41 sentence vs static `冬至`
- q41 sentence vs static `夏至`
- q41 container-child: `冬至中午的`
- q41 container-child: `倍`

Learn: 12 defects

- the same source-label/axis cluster above
- `春分` vs answer `偏北`
- `夏至` vs `太陽直射緯度漸往`
- answer `近` vs `米蘭科維奇3循環`
- answer `遠` vs `；高緯度夏季冰原較不易融。`
- q41 container-child also includes answer `1.47`

Next approach: move/remove only duplicated static labels that the source does not independently own; resize source-panel contentRect for q41; do not re-add full duplicate explanatory prose.

## p248

Recall: 7 defects

- 4 textText
- 3 overflowedText

Main issue: q15 is an enormous instruction block rendered across the interior figure/table and overflows badly.

Representative collisions:

- `地函、外核與內核` vs q15 instruction
- `觀測站1` vs `通常離震央愈近，`
- `S波速度（公里/秒）` vs `地函、外核與內核`
- `通常離震央愈近，` vs `震央`

Learn: 19 defects

- same structural problems
- q15 answer text (`地函`, `橄欖岩`, `固態`, `古氏不連續面`, `外核`, `Fe、Ni`, `液態`, `雷曼不連續面`, `內核`, etc.) all overflowing the current q15 owner
- one `0` vs `海洋` text collision

Likely root cause: q15 long instruction/answer presentation does not match the source layout. Inspect page 248 source photo and reconstruct q15 as the real source graph/table ownership instead of a giant paragraph over the figure.

## p249

Largest remaining page.

Recall: 26 defects

- textText: 21
- containerChild: 5

Learn: 37 defects

- textText: 25
- containerChild: 8
- overflowedText: 4

Strong duplicate-owner signatures:

- static earthquake-distance prose vs canonical soil-liquefaction q17
- static `ΔTps＝S/Vs－S/Vp` vs q17
- static graph ticks `4000/6000/8000` vs axis title/q18/q19
- `板塊構造學說` / `板塊邊界分布與類型` vs q20/q21 evidence prompt
- q21 evidence text repeatedly outside `p249-evidence`
- `D` vs `岩漿：`
- Learn overflow: q27 `琉球`, q23 `裂谷`, q23 `海溝`

Recommended order:

1. Inspect source p249.
2. Remove static explanatory text that duplicates canonical prompts.
3. Keep only truly independent figure labels/ticks.
4. Resize `p249-evidence` from source geometry.
5. Then fix remaining graph tick/axis placements.

Do not suppress these in QA.

## p250

Recall: 1 defect
Learn: 1 defect

- q17 container-child: `天氣變化主要發生在此層`

This is a single `p250-layers` contentRect/position issue.

## p253

Recall: 1 defect

- `流，流速較` vs `(40)`

Learn: 3 defects

- answer `北` vs static `季風—秋冬時期，`
- `流，流速較` vs `(40)`
- answer `快` vs `季風驅動海水沿著中國沿岸，形成由`

This is still the q40 large-wind/current branch. Keep q40 inside `p253-large-wind`; do not move q41 out of its source row just to make space. Instead compact/reflow q40 and remove any duplicated static explanatory fragment if source ownership shows the canonical row already owns it.

## Priority order for Codex

1. Re-check p243/p244/p246 because they are tiny/local.
2. Finish p253 q40 branch.
3. Finish p247 residual labels/panel containment.
4. Rebuild p248 q15 source ownership.
5. Rebuild p249 duplicate-owner areas.
6. Fix p250 one containment defect.
7. Re-run all 24 page-mode reports until every count is zero.
8. Run Wrongbook regressions.
9. Delete temporary V9 workflows.
10. Merge to `main`, wait for Pages, verify live.

## Required final source statement

`SOURCE AUTHORITY USED: ONLY the 12 photos in the current NEW_SOURCE_TRUTH pack.`
