---
name: wrongbook-test-sheet-ocr
description: Use for Wrong Book worksheet/test-sheet scanning, OCR, layout parsing, formula/figure extraction, question reconstruction, and token-efficient semantic analysis.
---

# Wrong Book Test-Sheet OCR

## Goal
Convert a photographed Taiwanese middle/high-school test question into a clean reusable question artifact:

`camera/photo -> document straighten -> user highlighter -> high-resolution OCR -> layout pruning -> clean question file -> semantic answer analysis`

The final Wrong Book page must show the complete printed prompt and the printed problem figure clearly. The raw camera photo is only a source-reference fallback.

## Rules
1. OCR before reasoning. First stage only transcribes and classifies layout.
2. Highlighter is an attention hint, not destructive OCR input. OCR reads complete lines/figures from original pixels.
3. Preserve resolution. Rebuild from original camera pixels after perspective correction; never OCR from a small preview if original pixels exist.
4. Preserve complete printed content: question number, full stem, choices/blanks, formulas, and required printed figures/tables/graphs. Never summarize.
5. Omit unusable regions only after OCR/layout classification: neighboring questions, background, page margins, fingers, irrelevant handwriting and notes.
6. Separate printed question from student work. Student final answer/necessary calculations remain analysis data; they are not baked into the clean printed question.
7. Keep printed diagrams/graphs/tables as separate high-quality crops. Reconstruct only when source-faithful.
8. Create a clean display artifact from native/vector text plus embedded problem figures.
9. Infer answer UI from the stem. Tuple/coordinates/equations/written answers are not fake multiple-choice chips.

## Token/cost policy
- OCR stage sends one tightly scoped high-resolution image.
- Do not send a separate selection-mask image to the paid OCR model when the crop already identifies the target.
- Semantic reasoning gets OCR text/structure, not the full page.
- If no printed figure is necessary, semantic reasoning is text-only.
- If a figure is necessary, send only that extracted figure crop.
- Never forward neighbor_question/background_noise/page margins/unrelated handwriting.
- Cache OCR JSON and the clean question artifact; opening an existing Wrong Book item does not run OCR again.

## Layout schema
Track at least question_number, printed_text, printed_figure, student_answer, student_work, neighbor_question, background_noise, with bbox/confidence/usableForAnalysis/usableForDisplay.

## QA gates
- full prompt present, no truncation
- printed figure visible when present
- neighboring question absent from primary display
- OCR uses high-resolution/original pixels
- second semantic stage never resends full page
- text-only question sends zero stage-2 images
- figure question sends only extracted figure
- clean question remains readable on phone and desktop
- `(r, s, d)=?` renders tuple inputs rather than option chips
