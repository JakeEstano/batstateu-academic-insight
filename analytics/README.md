# Part IV — Academic-risk classification demonstration

This workflow uses **fictional data only**. It does not use real university records, official grade cutoffs, verified SETE criteria, or student identities. The model is a separate case-study exercise and is not connected to the dashboard. It has not been validated for real academic decisions.

## Run it again

From the project root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r analytics/requirements.txt
.venv/bin/python analytics/train_knn.py
```

The fixed seed is 405. The script generates data, trains and evaluates KNN, and writes evidence files under `analytics/outputs/`. The dashboard runs independently.

## Seven modeling steps

1. **Define the problem and decision.** Predict whether a fictional student will fail at least one subject in the following semester. A positive prediction prompts supportive adviser review, not a penalty or automatic academic-standing decision. This is predictive classification.
2. **Collect or simulate data.** Generate 1,000 independent fictional records with a previous average grade (fictional 0–100 scale), attendance percentage, previous failed-subject count, and assignment completion percentage. Each input represents information available before the target outcome. SETE and protected demographic attributes are not inputs. Generate 400 separate records for the four dashboard periods.
3. **Prepare the data and split.** Use an 80/20 stratified train/test split. Training and test record identifiers are disjoint. Data contains no missing values because the generator supplies every feature. Do not infer that real records are this clean or that these fictional ranges represent institutional policy.
4. **Select a technique.** KNN classifies a record by the labels of nearby training examples. StandardScaler calculates z=(x−training mean)/training standard deviation. Euclidean distance in standardized feature space is sqrt(sum((x_j−neighbor_j)^2)). Uniform KNN votes by majority label. A model prediction is not proof of a future outcome.
5. **Train and tune.** Search k in {3,5,7,9,11,15,21,31} and uniform/distance weights using five-fold stratified cross-validation on the 800 training records. A pipeline fits scaling inside each fold, preventing preprocessing leakage. Select by recall, then refit on the 800 training records only. The test set never selects k or weights.
6. **Evaluate once on held-out records.** Compare predictions with the 200 synthetic test outcomes. Report recall and precision as the primary metrics, with accuracy, F1, a confusion matrix, and a majority-class baseline for context. Do not tune the model in response to these test results and reuse the same test as independent evidence.
7. **Interpret and report.** Present the held-out results, confusion matrix, and limitations in the case study. Do not treat the synthetic results as real-world student-risk screening evidence.

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

## Evidence files

- `outputs/synthetic_training_data.csv`: all labeled records and their train/test membership.
- `outputs/held_out_predictions.csv`: individual held-out outcomes and predictions for recomputing the confusion matrix.
- `outputs/metrics.json`: measured results, selection procedure, and baseline.
- `outputs/model-results.png`: ready-to-use results image for the case study.
- `outputs/model-results.pdf`: printable version of the results image.
- `knn_training_colab.ipynb`: self-contained notebook to rerun the exercise in Google Colab.

## Limits of the simulation

Synthetic outcome labels are sampled probabilistically from an intentionally invented relationship among the inputs. This relationship is a demonstration assumption, not research evidence about real students. Data-generation assumptions determine how easy the problem is; random train/test splitting here is not evidence of future-semester generalization. Model quality is evaluated only on the held-out labeled set. There is no real-world or subgroup validation, calibrated probability, causal finding, or basis for faculty/student personnel decisions.
