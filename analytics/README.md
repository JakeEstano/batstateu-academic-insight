# Part IV — Academic-risk classification demonstration

This workflow uses **fictional data only**. It does not use BatStateU records, official grade cutoffs, verified SETE criteria, or student identities. The dashboard's risk KPI now uses predictions from the trained demonstration model rather than preassigned flags. It has not been validated for real academic decisions.

## Run it again

From the project root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r analytics/requirements.txt
.venv/bin/python analytics/train_knn.py
```

The fixed seed is 405. The script generates the data, trains and evaluates KNN, writes evidence files under `analytics/outputs/`, and updates `src/data/riskPredictions.json`. Vite reloads the dashboard when that JSON changes. No Python server is needed to view the dashboard.

## Seven modeling steps

1. **Define the problem and decision.** Predict whether a fictional student will fail at least one subject in the following semester. A positive prediction prompts supportive adviser review, not a penalty or automatic academic-standing decision. This is predictive classification.
2. **Collect or simulate data.** Generate 1,000 independent fictional records with a previous average grade (fictional 0–100 scale), attendance percentage, previous failed-subject count, and assignment completion percentage. Each input represents information available before the target outcome. SETE and protected demographic attributes are not inputs. Generate 400 separate records for the four dashboard periods.
3. **Prepare the data and split.** Use an 80/20 stratified train/test split. Training and test record identifiers are disjoint. Data contains no missing values because the generator supplies every feature. Do not infer that real records are this clean or that these fictional ranges represent institutional policy.
4. **Select a technique.** KNN classifies a record by the labels of nearby training examples. StandardScaler calculates z=(x−training mean)/training standard deviation. Euclidean distance in standardized feature space is sqrt(sum((x_j−neighbor_j)^2)). Uniform KNN votes by majority label. A model prediction is not proof of a future outcome.
5. **Train and tune.** Search k in {3,5,7,9,11,15,21,31} and uniform/distance weights using five-fold stratified cross-validation on the 800 training records. A pipeline fits scaling inside each fold, preventing preprocessing leakage. Select by recall, then refit on the 800 training records only. The test set never selects k or weights.
6. **Evaluate once on held-out records.** Compare predictions with the 200 synthetic test outcomes. Report recall and precision as the primary metrics, with accuracy, F1, a confusion matrix, and a majority-class baseline for context. Do not tune the model in response to these test results and reuse the same test as independent evidence.
7. **Apply and monitor.** Predict the 400 separate synthetic dashboard records with the same evaluated, training-only fitted pipeline. Export anonymous prediction labels. Calculate the semester risk KPI as flagged predictions / assessed records × 100. Before any real deployment, require authorized data, a defensible target, temporal/external validation, subgroup error analysis, human review, and monitoring for changing performance.

## Measured results

Selected model: **k=5, uniform weights**. Mean training cross-validation recall: **52.73%**.

Held-out test results:

| Metric | KNN | Majority-class baseline |
|---|---:|---:|
| Accuracy | 82.0% | 75.0% |
| Precision | 67.5% | 0% (no positive predictions) |
| Recall | 54.0% | 0% |
| F1 | 60.0% | 0% |

Confusion matrix (positive means actually fails a subject in the fictional following semester):

| Actual outcome | Predicted not at risk | Predicted at risk |
|---|---:|---:|
| Not at risk | TN = 137 | FP = 13 |
| At risk | FN = 23 | TP = 27 |

- Recall = TP/(TP+FN) = 27/50 = 54.0%.
- Precision = TP/(TP+FP) = 27/40 = 67.5%.
- Accuracy = (TP+TN)/N = 164/200 = 82.0%.
- F1 = 2×precision×recall/(precision+recall) = 60.0%.

**Interpretation:** The model identifies 27 of 50 positive cases and misses 23. It flags 13 negative cases incorrectly. It exceeds the majority baseline's accuracy, but its 54% recall is insufficient to claim dependable student-risk screening. These limitations must remain in the report; do not present 82% accuracy alone as success.

## Dashboard integration

| Demo period | Predicted at risk | Assessed | KPI |
|---|---:|---:|---:|
| 2025–2026, first semester | 20 | 100 | 20% |
| 2025–2026, second semester | 17 | 100 | 17% |
| 2026–2027, first semester | 28 | 100 | 28% |
| 2026–2027, second semester | 16 | 100 | 16% |

The default risk KPI changes from the old invented 35% to **28%**, the actual prediction count. The existing >25% warning still triggers. The other four KPIs are unchanged. The new rates should also be reflected in your written case study and presentation.

Open the At-Risk Student Rate card for model inputs, selected settings, held-out results, and limitations. The displayed target ≤20% and warning >25% remain proposed management thresholds; they are not the KNN decision boundary or verified university policy.

## Evidence files

- `outputs/synthetic_training_data.csv`: all labeled records and their train/test membership.
- `outputs/held_out_predictions.csv`: individual held-out outcomes and predictions for recomputing the confusion matrix.
- `outputs/dashboard_input_predictions.csv`: four input features and model predictions for all dashboard periods.
- `outputs/metrics.json`: measured results, selection procedure, baseline and per-period totals.
- `../src/data/riskPredictions.json`: dashboard-ready outputs and model metadata.

## Limits of the simulation

Synthetic outcome labels are sampled probabilistically from an intentionally invented relationship among the inputs. This relationship is a demonstration assumption, not research evidence about real students. Data-generation assumptions determine how easy the problem is; random train/test splitting here is not evidence of future-semester generalization. Dashboard period labels are illustrative, not observed cohorts. There are no confirmed outcomes for the separate dashboard inference records, so model quality is evaluated only on the held-out labeled set. There is no real-world or subgroup validation, calibrated probability, causal finding, or basis for faculty/student personnel decisions.
