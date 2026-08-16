# CODEX HANDOFF — FINISH EARTH SCIENCE MIND-MAP V9 SOURCE-TRUTH RECONSTRUCTION

## Mission

Continue the active Earth Science (`地科`) mind-map reconstruction in `jamshih/html` **from the current branch state**. Do not restart, do not replace the Wrongbook architecture, and do not stop at an audit. The job is complete only when all 12 Earth source pages 242–253 pass strict Recall + Learn visual/collision QA, existing Wrongbook regressions pass, temporary QA workflows are removed, the finished branch is merged to `main`, GitHub Pages is built, and the live site is verified.

This is a continuation task after extensive work. The branch already contains a V9 source hierarchy, strict QA, source-owned renderers, debug overlays, source-traced page renderers, and many page-specific fixes.

---

## Repository / branch / current state

- Repository: `jamshih/html`
- Working branch: `earth-source-hierarchy-v9-20260816`
- **Implementation head immediately before this handoff file:** `163e7b725b4d14d38206377071ed66f2f94c7ac9`
- Do **not** work on `main` until strict V9 acceptance is green.
- Production `main` before V9 work started was based on `78bb403777981296ca0f7a7ce4b81a926a23482e`.
- Live site when complete: `https://jamshih.github.io/html/wrongbook-v2/`

Current workflows on the V9 branch include temporary diagnostic/gate workflows. They are intentionally useful during development, but **must not remain on `main`** after acceptance.

Important temp workflows currently present:

- `.github/workflows/earth-source-hierarchy-v9-temp.yml`
- `.github/workflows/earth-v9-visual-diagnostic-temp.yml`
- `.github/workflows/earth-v9-source-snapshot-temp.yml`

There may be unrelated Hearframe workflow failures on pushes (`hearframe-static-audio-contexts.yml`). Ignore those when judging Wrongbook/Earth V9.

---

## Absolute source authority

The ONLY visual authority is the user's NEW source pack:

`EARTH_MINDMAP_NEW_SOURCE_TRUTH_WITH_GRID (1).zip`

Original local extraction used during this work:

`/mnt/data/earth_v9_source/`

Important contents:

- `01_ONLY_SOURCE_12_PHOTOS/` — ONLY visual source authority
- `02_NORMALIZED_SOURCE_PAGES/page_242...253_ONLY_SOURCE_NORMALIZED.png`
- `03_GRID_REFERENCE_910x1270/page_242...253_ONLY_SOURCE_GRID_910x1270.png`
- `04_NEW_SOURCE_MANIFEST.json`
- `05_EXECUTE_ONLY_NEW_SOURCE_PROMPT.md`
- `README_FIRST.txt`

If Codex does not have this pack in its runtime, the user must attach it there. **Do not substitute any older photos, atlases, screenshots, old V4/V6/V7 geometry, or the current website rendering as visual authority.** Older code may be reused as implementation machinery only.

Final report must contain this exact sentence:

`SOURCE AUTHORITY USED: ONLY the 12 photos in the current NEW_SOURCE_TRUTH pack.`

---

## Non-negotiable acceptance contract

Canvas for each source page is `910 × 1270`.

Pages: 242–253 inclusive.

All publisher-printed objects must be represented faithfully. Ignore handwriting/student answers.

The canonical printed prompt corpus must remain exactly **276 items**:

- Chapter 1: 48
- Chapter 2: 50
- Chapter 3: 41
- Chapter 4: 27
- Chapter 5: 60
- Chapter 6: 50
- Total: 276

Strict acceptance requires zero unintended collisions in **both Recall and Learn/answer-visible mode**:

- text/text
- text/connector
- text/graph
- text/figure
- blank/connector
- blank/graph
- figure/figure
- container-child containment
- clipped text
- overflowed text
- micro-font workaround
- duplicate visual owner
- wrong parent

Do not make the gate green by weakening the classifier, adding broad allowlists, shrinking text below acceptable size, hiding canonical content, or using z-index tricks to conceal bad geometry.

Use real source hierarchy, real parent/child grouping, and source-local coordinates where appropriate.

Required debug mode remains:

`?earthLayoutDebug=1`

Expected colors:

- green text rects
- blue content rects
- cyan figure safe areas
- orange connectors
- red collisions
- parent labels

Spatial QA uses RBush/equivalent (`earth-rbush-v9.js`), per-line `Range.getClientRects()`, and sampled connector/graph paths.

---

## Critical canonical/content rules that must not regress

### Page 243 canonical Q48/Q49 special case

The printed page visibly contains `(48)` and `(49)`, but they are two printed fields belonging to **one canonical learning item Q48**.

Requirements:

- canonical owner is `data-question="48"`
- printed `(49)` remains visibly present
- there must be **no standalone canonical Q49**
- canonical validator must still report 276 total / 276 unique

### Static answer leak rules

Page 244 star color:

- printed scaffold only: `高溫 → 低溫`, `恆星顏色 (3) ______`, `太陽`
- answer `藍 > 白 > 黃 > 橘 > 紅` must NOT be static

Page 243 radioactive-decay graph:

- `母元素` / `子元素` are answers and must remain interactive blanks, not static labels

### One visual owner

Do not duplicate explanatory prose in static SVG/HTML if the same printed content is already canonical prompt text. Several remaining bugs came from legacy decorative prose plus canonical prompt text occupying the same source position.

---

## V9 architecture already implemented

Primary V9 files:

- `wrongbook-v2/earth-source-hierarchy-v9-loader.js`
- `wrongbook-v2/earth-source-hierarchy-v9.js`
- `wrongbook-v2/earth-rbush-v9.js`
- `wrongbook-v2/earth-source-hierarchy-v9-renderer.js`
- `wrongbook-v2/earth-source-hierarchy-v9.css`
- `wrongbook-v2/earth-layout-qa-v9.js`
- `wrongbook-v2/earth-layout-debug-v9.js`

The tail loader (`earth-source-trace-tail-loader-v6.js`) now late-loads V9. Older p253 correction overlay files were intentionally removed from the final loader path so p253 is not rendered as a base page plus a second corrective ownership layer.

Pages 252–253 use V9 source-owned rendering. Pages 242–251 reuse their source-trace renderers and are annotated into V9 ownership/QA.

The QA expects real parent ownership according to `SOURCE_HIERARCHY_V9`.

---

## Important V9 hierarchy details already encoded

### Page 252

Top-level:

- `p252-typhoon`
- `p252-air-sea`
- `p252-ocean`

ENSO hierarchy:

- `p252-enso`
- `p252-enso-figure`
- `p252-enso-q17`
- `p252-enso-q19`

Q18 was recently physically nested into `p252-enso-figure` to match source ownership.

Ocean hierarchy includes:

- `p252-horizontal`
- `p252-normal-pacific`
- `p252-upwelling-q16`
- `p252-mixed-upwelling`
- `p252-temp-depth`
- `p252-temp-explain`
- `p252-salinity`
- `p252-salinity-graph`

Page 252 was fully clean in Recall + Learn on the last completed strict gate before the newest p247 work.

### Page 253

Hierarchy includes:

- `p253-climate`
  - `p253-climate-left`
  - `p253-greenhouse-cloud`
  - `p253-energy`
  - `p253-plate-strip`
- `p253-ocean-motion`
  - `p253-cause`
    - `p253-large-wind`
  - `p253-three`
    - `p253-current`
    - `p253-wave`
      - `p253-nearshore`
    - `p253-tide`

The branch contains recent Learn-mode spacing work for q40/q41 and the large-wind/current boundary. Re-check current strict output before further edits.

---

## Source geometry reminders for dense Ch6 pages

### p252 source truth

- Typhoon block roughly x55/y235 through x485/y525; q1–7.
- Air-sea/ENSO overall ~x480–820, y~210–480 in source.
- q17 boxed around x690,y220,w130,h55.
- q19 boxed around x485,y286,w80,h55.
- ENSO colored figure roughly x580,y280,w230,h190.
- q18 near x600,y455.
- Ocean starts near y500.
- Normal Pacific source figure around x115,y565,w320,h150.
- q8–10 around x515,y620/660/705.
- mixed/upwelling source box around x460,y780,w330,h75.
- temp-depth graph around x465,y930,w180,h150–190; q12–14 anchored around it.
- q15 source box around x640,y945,w170,h110.
- salinity text left x55,y805 downward.
- salinity graph around x465,y1085,w200–230,h145–160.

### p253 source truth

- climate group roughly x45–830,y55–500.
- q27 ~x100,y135; q28 ~x100,y180; q31 ~x285,y220; q32 ~x90,y425.
- greenhouse peach cloud x~45–245,y220–320; q29/q30 blanks begin inside cloud but prompt text extends right.
- q33 top-center/right ~x355,y80–120.
- energy figure sun/arrows/surface x~525–825,y20–415.
- q34 ~x410,y375; q35 ~x625,y290.
- q36 plate strip ~x340,y460.
- ocean movement starts y~535.
- root green line x~90 from ~610 to 1060.
- q37 around x300–810,y555–625.
- large wind branch ~x290–810,y630–770; q38–40.
- q41 around x190,y800; q42 around x715,y840.
- waves q43–45 around x430+ y875–990.
- tides q46–50 y1045–1210.

---

## Work already completed immediately before handoff

Do NOT redo these blindly; verify them first.

### p242 — verified clean

Fixed real connector routing conflicts (nebula branch and planet connectors) instead of allowlisting them.

Last completed strict gate showed p242 `0` in every category in both Recall and Learn.

### p245 — verified clean

Removed duplicate legacy Hubble-law visual owner (`q50b`) because canonical Q50 already owns the printed content. Separated blackbody axis tick/caption geometry.

Last completed strict gate showed p245 fully clean in Recall + Learn.

### p251 — verified clean in last completed gate

Moved q40–q44 lower circulation rows beneath the source diagrams, especially q42 separation.

Last completed strict gate showed p251 fully clean in Recall + Learn.

### p252 — verified clean

Recent fixes included:

- q10 moved down away from q9 Learn answer
- q8 width/answer width constrained away from `垂直變化`
- q18 physically nested in ENSO source figure
- source parent ownership corrected

Last completed strict gate showed p252 fully clean in both modes.

### p243 — substantial cleanup done, re-check current output

Recent edits in `earth-source-trace-p243-true-v6.css`:

- corrected decay graph time label placement
- expanded q39 source width
- explicitly placed `eraHeading`
- widened q48/(printed 49) composite answer spaces without creating canonical Q49

Last completed gate before these newest edits still had only a handful of p243 defects; current branch may be better.

### p244 — substantial cleanup done, re-check current output

Recent edits include:

- widened q6 and q21 source rows
- rerouted brightness connector
- moved factor label

Current branch needs strict re-check.

### p246 — hierarchy + annual-panel ownership fixed, re-check current output

Recent fixes:

- q8/q9 belong to zodiac/orbit area, not annual source panel
- q10/q11/q12 placed in the three real annual-motion bands
- hierarchy `p246-annual` content rect updated

Current branch needs strict re-check.

### p247 — newest patch, NOT YET VERIFIED AT HANDOFF TIME

Implementation head `163e7b7...` contains a major p247 source-owner cleanup:

- removed duplicated bottom prose that was colliding with canonical prompts
- `V6_P247_BOTTOM` now contains source scaffolding/headings rather than full canonical explanatory sentences
- repositioned lower source anchors/rows
- updated p247 CSS for bottom-cycle/insolation layout

The strict workflow run for this newest p247 patch was still in progress when this handoff was written:

`https://github.com/jamshih/html/actions/runs/31949444144`

**First Codex action should be to inspect the completed result of that run/artifact.**

---

## Last fully inspected strict gate before newest p247 patch

Last completed gate that was fully downloaded and inspected:

- Run: `31949128550`
- Head at that run: `78a13daa8e51780f94416c0bd542e7f42292636e`
- Artifact: `earth-source-hierarchy-v9-proof`

At that point:

### Fully clean both modes

- p242
- p245
- p251
- p252

### Small/local remaining defects

#### p243
Recall failure signature included:

- text-text: `……` vs `3`
- connector touching `各時期代表化石`
- q39 clipped/overflowed `個半衰期`
- q38 `%` overflow

Learn additionally had a small fossil-era/q46 overlap.

Note: several of these were edited AFTER that run in `earth-source-trace-p243-true-v6.css`, so re-check before editing again.

#### p244
At run 47:

- one connector crossed `受兩因素影響`
- q6 suffix `² 成反比` overflow
- q21 suffix `ly` overflow

These were edited after run 47. Re-check current output first.

#### p246
At run 47:

- q11 `小時` vs q12 collision
- q12 annual container-child failure

The annual panel was edited after that run. Re-check current output.

#### p250
At run 47:

- one containment issue: q17 `天氣變化主要發生在此層` outside `p250-layers`

The hierarchy/source-panel was edited after that run. Re-check current output.

#### p253
At run 47:

- Recall: one text overlap involving `流，流速較` and `(40)`
- Learn had several q40/q41 boundary conflicts

The p253 q40 row was compacted after that run. Re-check current output.

### Dense remaining pages at run 47

#### p247
At run 47 there were many duplicate static/canonical collisions. Most were clearly caused by static explanatory prose in the old renderer plus canonical question text.

Examples:

- duplicated seasonal/cycle prose
- duplicated ice-age combination sentence
- duplicated orbital-eccentricity/season-change sentence
- q34/q36/q37 containment in orbit-cycle source panel
- q39/q41 containment in insolation source panel

The new p247 patch at `163e7b7...` specifically targets this and must be evaluated before further changes.

#### p248
At run 47:

- 4 text-text
- 3 overflow

Representative problems:

- giant Q15 instruction text overlapping interior figure/source labels
- `觀測站1` vs `通常離震央愈近`
- `S波速度（公里/秒）` vs `地函、外核與內核`
- Q15 instruction overflow

Likely approach: stop rendering long instructor/instruction prose over the source diagram if it is not literally printed in that visible region, or re-own it into the correct source panel; inspect page 248 source photo first.

#### p249
At run 47:

- 21 text-text
- 5 container-child

This page likely still has the same duplicate-owner pattern seen on p247: static explanatory paragraphs/axis labels plus canonical prompts rendered together.

Representative collisions:

- earthquake-distance explanatory prose vs soil-liquefaction prompt
- `ΔTps＝S/Vs－S/Vp` vs q17
- graph ticks (`4000`, `6000`, `8000`) vs x-axis title/q18/q19
- static `板塊構造學說` / `板塊邊界分布與類型` vs canonical q20/q21 evidence text
- source evidence panel q21 containment failures
- `D` vs `岩漿：`

Likely approach: compare the source photo and identify which printed wording should have a single visual owner. Remove duplicated static copy, do not hide canonical prompts.

---

## Required Codex workflow

### 1. Start by inspecting actual branch HEAD and newest strict run

```bash
git fetch origin
git checkout earth-source-hierarchy-v9-20260816
git pull --ff-only
```

Confirm head is at least the implementation commit mentioned above plus this handoff commit.

Inspect newest Actions runs for:

- `Earth Source Hierarchy V9 Temp Gate`
- `Earth V9 Full Visual Diagnostic Temp`

Download artifact `earth-source-hierarchy-v9-proof` from the newest strict run.

The artifact contains:

- `earth-v9-qa.html`
- chapter Recall screenshots
- chapter Learn screenshots
- Ch6 debug screenshot

Read `#earth-layout-qa-results` from `earth-v9-qa.html`; do not rely only on workflow conclusion.

### 2. Use rendered visual debugging, not static guesses

Preferred validation loop:

- run the repo locally if practical
- Browser plugin first if available; otherwise Playwright
- exact target: Wrongbook Earth mind-map pages in Recall and Learn
- inspect `?earthLayoutDebug=1`
- compare source grid vs render vs 50% overlay

For each fix, prove:

- page identity
- nonblank render
- no framework overlay
- console health
- screenshot evidence
- relevant interaction/mode switch

### 3. Fix structural ownership before geometry

Order of operations on a failing item:

1. Is this the same printed content rendered twice? Remove the duplicate visual owner.
2. Is canonical question parent wrong? Fix `SOURCE_HIERARCHY_V9` ownership / DOM nesting.
3. Is a connector genuinely crossing unrelated content? Reroute connector according to source.
4. Is a prompt/answer width wrong? Resize/reposition without micro-font.
5. Is a source panel contentRect wrong? Correct it from the source grid.
6. Only if source truly shows an overlap should QA encode a narrow, justified association.

Never solve a visual problem with broad suppression.

### 4. Keep canonical corpus intact after every major batch

Validator must remain:

- 276 items
- 276 unique

Page 243 must preserve composite Q48/printed-Q49 behavior.

### 5. Get all 24 page-mode reports green

12 pages × 2 modes.

Every category must be zero.

No micro-font collision workaround.

### 6. Run existing Wrongbook regression QA

Discover/re-run relevant existing workflows, including at minimum the Wrongbook V2 QA and full-page visual QA if present.

Do not change unrelated features.

Preserve:

- corrected-truth flow
- spaced review
- original problem workspace
- guide-v3 handwriting actions
- whole-sheet scan
- cloud sync / Supabase
- PWA/mobile
- Taiwan curriculum UI
- community
- V5 concepts/tutor/learning objects

### 7. Remove development-only workflows before main

Before merge, delete the temporary V9 workflows mentioned above if they are still present.

Do not ship the source snapshot temp workflow to production.

### 8. Merge only after green acceptance

Merge V9 branch into `main` only after strict QA and Wrongbook regressions are green.

Then verify GitHub Pages build and public bytes.

Live verification must confirm:

- V9 assets load
- 276 canonical prompts
- p243 composite Q48 / no canonical Q49
- no p244/p243 static answer leaks
- p252/p253 final source ownership markers
- Recall and Learn behave correctly

---

## Files most likely to edit next

Prioritize current output, but likely targets are:

- `wrongbook-v2/earth-source-trace-p247-v6.js`
- `wrongbook-v2/earth-source-trace-p247-v6.css`
- `wrongbook-v2/earth-source-trace-p248-v6.js`
- `wrongbook-v2/earth-source-trace-p248-v6.css`
- `wrongbook-v2/earth-source-trace-p249-v6.js`
- `wrongbook-v2/earth-source-trace-p249-v6.css`
- `wrongbook-v2/earth-source-trace-p243-true-v6.css`
- `wrongbook-v2/earth-source-trace-p244-v6.css`
- `wrongbook-v2/earth-source-refine-p246-annual-v7.js`
- `wrongbook-v2/earth-source-hierarchy-v9.js`
- `wrongbook-v2/earth-source-hierarchy-v9.css`
- `wrongbook-v2/earth-layout-qa-v9.js` **only for genuine classifier bugs, never to suppress real collisions**

Avoid touching unrelated Wrongbook files unless a regression proves they are involved.

---

## Recently useful debugging facts

- The GitHub strict workflow is the reliable browser-rendered QA path.
- A temporary source snapshot workflow was added because connector reads were truncating large files; Codex with a normal checkout should not need that workaround.
- The strict QA artifact is much more useful than raw Actions log output because it includes `earth-v9-qa.html` and screenshots.
- The Ch6 renderer had previously been creating source-owned groups correctly, but the key rule remains: one canonical interactive node per question; never create a second interactive copy just to place it visually.
- Learn mode often reveals collisions invisible in Recall because answer strings are wider. Always test both.

---

## Definition of done

Do not report completion until ALL are true:

1. Source authority is only the current 12-photo pack.
2. All pages 242–253 visually correspond to source hierarchy.
3. Canonical corpus is exactly 276/276 unique.
4. Recall mode: every strict collision category = 0 on all 12 pages.
5. Learn mode: every strict collision category = 0 on all 12 pages.
6. No micro-font workaround.
7. No duplicate visual owner.
8. No wrong parent.
9. Existing Wrongbook regression QA passes.
10. Temporary V9 workflows removed before main.
11. Merged to `main`.
12. GitHub Pages build succeeds.
13. Live public site is browser-tested.
14. Final report includes commit SHA(s), workflow run IDs, Pages verification, and exact source-authority sentence.

Do not stop at a failing alignment report. Fix it and continue.
