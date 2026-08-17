# Wrongbook Mind Map — Clearnote Enrichment Status

Updated: 2026-08-17
Branch: `wrongbook-clearnote-enrichment-20260817`
Dedicated QA run: `31996100469`

## Goal

Apply the Earth Science reconstruction lessons to the other Wrongbook subjects while using Clearnote as a secondary research corpus for student-friendly arrangement and candidate content emphasis.

Clearnote is not treated as factual source truth. Public student notes may contain mistakes, Simplified/Mainland terminology, handwriting ambiguity, author-specific shortcuts, or obsolete scope. The new process separates arrangement discovery from factual acceptance.

## Implemented source policy

Authority order:

1. current user-designated source pack, when supplied;
2. official Taiwan/NAER 108 curriculum scope;
3. verified Wrongbook canonical curriculum data;
4. authoritative subject references;
5. mutually consistent high-quality study references;
6. Clearnote/public student notes;
7. contextual inference from ambiguous handwriting/OCR.

Clearnote can suggest a relation, omission, comparison, example or study emphasis. It cannot override verified canonical content by popularity alone.

## Implemented text repair

The renderer now includes a conservative Taiwan-term normalization layer for known cases, including:

- 線粒體 / 线粒体 → 粒線體;
- 高爾基體 / 高尔基体 → 高基氏體;
- 酶 → 酵素;
- 概率 → 機率;
- 種群 / 种群 → 族群;
- 群落 → 群集;
- 生境 → 棲地;
- 質粒 / 质粒 → 質體;
- 矢量 → 向量;
- 勢能 / 势能 → 位能;
- 電勢 / 电势 → 電位;
- 摩爾 / 摩尔 → 莫耳;
- 數據 / 数据 → 資料 where this curriculum context means data;
- 視頻 / 视频 → 影片;
- 信息 → 資訊.

This is not a blind Simplified-to-Traditional converter. Ambiguous or concept-sensitive source material must be reconstructed from semantic context and verified before becoming canonical.

## Implemented semantic layout grammar

The old non-Earth renderer mostly alternated diagram and flow arrangements. It now assigns layouts by subject and concept semantics.

Supported layout intents:

- `diagram` — spatial/structural relationship;
- `flow` — mechanism/process/causal sequence;
- `compare` — parallel concepts/systems/conditions;
- `timeline` — genuine chronological sequence;
- `formula` — formal relation + condition + representation;
- `tree` — hierarchy/classification/text structure.

Every section exposes `data-v4tb-layout` for QA.

## Subject arrangement policy

- Chinese: text/literary hierarchy, article structure, rhetoric/meaning comparisons.
- English: form → meaning → condition → example → common-error comparison; writing as flow.
- Mathematics: formula families with assumptions/domain, graphs/geometry as diagram, similar cases as comparison.
- Physics: physical situation/vector/graph first, formula cluster with units/conditions, processes and conservation as flow.
- Chemistry: macroscopic observation ↔ particle model ↔ symbolic relation; reaction flow, structure diagrams, formula/condition groups.
- Biology: structure/function as diagrams, metabolism/regulation as flow, similar biological systems as comparison, ecology/classification as hierarchy.
- History: chronology only when chronology is real; otherwise source/causality/hierarchy/comparison.
- Geography: map/spatial anchor, physical processes as flow, climate/region/population/industry comparisons.
- Civics: actor/institution/power/procedure/remedy; systems as comparison, procedures as flow, legal/institutional hierarchy as tree.

## Human-reading improvements

Every semantic section now carries a small reading cue that tells the student how to read that cluster, e.g.:

- diagram: 位置 → 結構 → 功能 → 關聯;
- flow: 條件 → 過程 → 轉折 → 結果;
- comparison: 定義 → 條件 → 差異 → 易混點;
- timeline: 背景 → 轉折 → 結果 → 長期影響;
- formula: 條件 → 符號/單位 → 圖像 → 常見陷阱;
- hierarchy: 核心概念 → 分類 → 特徵 → 例子/例外.

These cues are not new canonical answers; they are retrieval/reading scaffolds.

## New QA rules

The cross-subject QA now rejects:

- missing/unknown semantic layout;
- timeline layout without sequence semantics;
- formula layout without formal/quantitative semantics;
- known banned Mainland/Simplified terminology in rendered canonical text;
- unresolved `needs_source_review` markers reaching the user;
- all previously checked missing/duplicate/ownership/overflow/micro-font/collision/page-artifact failures.

## Dedicated validation result

Run `31996100469` completed successfully.

### Desktop

- 9 non-Earth subjects;
- 105 / 105 chapters rendered;
- 618 / 618 canonical learning items rendered;
- QA issue totals: 0;
- PASS.

### Mobile

- 9 non-Earth subjects;
- 105 / 105 chapters rendered;
- 618 / 618 canonical learning items rendered;
- QA issue totals: 0;
- PASS.

### Layout coverage across the 105 chapters

- tree: 60 sections;
- flow: 30 sections;
- compare: 32 sections;
- formula: 29 sections;
- diagram: 46 sections;
- timeline: 13 sections.

The totals are section counts, not chapter counts; a chapter may contain multiple layout types.

### Earth regression

- current Earth source-truth regression: PASS;
- current Earth source-refinement regression: PASS.

No Earth source-authority, 276-item corpus, figure inventory, connector contract or source geometry was replaced by Clearnote-derived material.

## Screenshot review

Desktop and mobile representative screenshots were captured for all nine non-Earth subjects. Review confirmed:

- semantic layouts remain readable;
- prompts and blanks remain owned by their sections;
- no page-index/mascot artifacts returned;
- no micro-font fallback was introduced;
- mobile stacks multi-column layouts instead of shrinking the entire map;
- the new reading cues remain subordinate to the educational content.

## Content enrichment rule going forward

When Clearnote exposes useful additional content, it should be classified as one of:

- VERIFIED;
- CORRECTED;
- CONTEXT_REPAIRED;
- REJECTED.

A supplement is allowed only if it adds a useful dimension such as condition, exception, comparison, mechanism, representative example, graph/unit interpretation, source evidence, or a common confusion. It must not be added merely because there is blank space.

## Scope caveat

This enrichment improves how the existing verified Taiwan curriculum corpus is structured and reviewed. It does not claim that every Clearnote notebook has been copied or reconstructed, and it deliberately does not copy public notes wholesale. If the user later designates a specific notebook/image/textbook page as source material, that source is processed individually through the full Earth-derived extraction and verification workflow.
