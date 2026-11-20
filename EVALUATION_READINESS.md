# BAT405 dashboard evaluation readiness

This checklist maps the revised evaluation questionnaire to features an evaluator can demonstrate. The dashboard uses fictional, aggregated sample data. Proposed targets and alerts are case study rules, not university policy. Evaluator ratings remain their judgment.

## A. Relevance and information organization

1. Purpose and user: **Academic Overview** identifies academic performance, teaching effectiveness, emerging concerns, and the BSIT Program Chair demo view.
2. Important information: the five KPIs, three charts, and alerts are visible on the main page.
3. Logical arrangement: filters → KPIs → trends and subject comparison → teaching dimensions and alerts.
4. Records versus analysis: the “How to read this view” note distinguishes sample counts and ratings from calculated rates, trends, and threshold alerts. KPI detail dialogs show formulas.

## B. KPI design and interpretability

1. Five cards: on-time grade submission, subject passing rate, subjects below 80% passing, SETE participation rate, and average SETE rating.
2. Each card has a plain-language label, value, status, and explanatory detail dialog.
3. Academic year and semester appear in filters and the header; every card displays its proposed target, and details include formulas and prior-semester comparisons.
4. The course-level count and its alert reveal a subject concern even when the overall passing rate meets its target.

## C. Data visualization and dashboard design

1. Three visualizations: SETE rating timeline, subject passing-rate bar chart, and SETE teaching-dimension heatmap.
2. Charts identify periods, subjects, percentages or scores out of five, and explain target/reference lines and color meanings.
3. The timeline and heatmap show semester trends; bars compare subjects in the selected period.
4. The chart area uses short labels, tooltips, and detail dialogs to keep context available without filling the charts with text.

## D. Interactivity and navigation

1. Year and semester filters, reset, KPI detail buttons, chart details, heatmap cells, and alert details are available.
2. Control labels, hints, and dialog titles explain what each interaction does.
3. A Program Chair can compare periods, inspect courses, interpret SETE alongside participation, and review proposed alerts.
4. Changing year or semester recalculates KPIs, alerts, bar chart, and heatmap; the timeline stops at the selected period. Reset restores AY 2026–2027, First Semester.

## E. Decision support and alerts

1. The default period has alerts for low SETE participation and one subject below the proposed 80% passing review threshold.
2. Each alert states the observed value and the proposed condition that triggered it.
3. Alert details suggest a review or support action.
4. The dashboard describes alerts as prompts to investigate and marks all data and thresholds as illustrative.

## F. Privacy and responsible SETE interpretation

1. No student names, faculty names, individual ratings, or confidential comments appear. The view is a demonstration and does not claim live authentication.
2. SETE participation and period are visible; semester detail shows valid completions.
3. The footer and SETE details say ratings should be considered with course context and other evidence.
4. Scores are aggregated and framed as supporting evidence, with low participation called out.

## Demonstration path

Open the default period, select the new **Subjects Below 80% Passing** card, inspect the amber subject bar, open both alerts, switch semester, then reset. Select a timeline point and a heatmap cell to show SETE period, participation, and dimension context.
