"""Reproducible synthetic-data demonstration; never use for real student decisions."""
import csv
import json
import math
import random
from pathlib import Path

import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'analytics' / 'outputs'
SEED = 405
FEATURES = ['previous_average_grade', 'attendance_percent', 'previous_failed_subjects', 'assignment_completion_percent']
PERIODS = ['2025-1', '2025-2', '2026-1', '2026-2']


def student(rng, key, with_outcome=False):
    # Fictional 0–100 grade scale, not an assertion about BatStateU grading.
    preparedness = rng.gauss(0, 1)
    clip = lambda value, low, high: max(low, min(high, value))
    grade = round(clip(77 + 10 * preparedness + rng.gauss(0, 6), 35, 99), 1)
    attendance = round(clip(84 + 9 * preparedness + rng.gauss(0, 8), 35, 100), 1)
    completion = round(clip(80 + 12 * preparedness + rng.gauss(0, 10), 20, 100), 1)
    failed = int(clip(round(0.7 - 0.65 * preparedness + rng.gauss(0, 0.8)), 0, 5))
    row = dict(zip(FEATURES, [grade, attendance, failed, completion]))
    row = {'record_key': key, **row}
    if with_outcome:
        # A probabilistic fictional next-semester outcome. No deterministic threshold label.
        log_odds = -1.9 + (75-grade)*0.065 + (80-attendance)*0.045 + failed*0.6 + (75-completion)*0.035
        probability = 1 / (1 + math.exp(-log_odds))
        row['failed_next_semester'] = int(rng.random() < probability)
    return row


def write_csv(name, rows):
    with (OUT / name).open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def scores(actual, predicted):
    return { 'accuracy': accuracy_score(actual, predicted),
             'precision': precision_score(actual, predicted, zero_division=0),
             'recall': recall_score(actual, predicted, zero_division=0),
             'f1': f1_score(actual, predicted, zero_division=0),
             'confusion_matrix': confusion_matrix(actual, predicted, labels=[0,1]).tolist() }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = random.Random(SEED)
    rows = [student(rng, f'training-demo-{i+1:04}', True) for i in range(1000)]
    train, test = train_test_split(rows, test_size=0.2, stratify=[r['failed_next_semester'] for r in rows], random_state=SEED)
    x = lambda records: [[r[f] for f in FEATURES] for r in records]
    y = lambda records: [r['failed_next_semester'] for r in records]
    pipeline = Pipeline([('scale', StandardScaler()), ('knn', KNeighborsClassifier())])
    search = GridSearchCV(pipeline, {'knn__n_neighbors':[3,5,7,9,11,15,21,31], 'knn__weights':['uniform','distance']},
                          scoring='recall', cv=StratifiedKFold(5, shuffle=True, random_state=SEED), n_jobs=1)
    search.fit(x(train), y(train))
    predicted = search.predict(x(test))
    baseline = DummyClassifier(strategy='most_frequent').fit(x(train), y(train))
    metrics = scores(y(test), predicted)
    test_keys = {r['record_key'] for r in test}
    assert not test_keys.intersection(r['record_key'] for r in train)
    assert sum(sum(row) for row in metrics['confusion_matrix']) == len(test)
    write_csv('synthetic_training_data.csv', [{**r, 'split':'test' if r['record_key'] in test_keys else 'train'} for r in rows])
    write_csv('held_out_predictions.csv', [{**r, 'predicted_at_risk':int(p)} for r,p in zip(test,predicted)])
    # Use exactly the training-only fitted pipeline evaluated above. Do not refit on the test set.
    demo_rng = random.Random(SEED + 100)
    dashboard_rows = []
    exported = {}
    for period in PERIODS:
        records = [student(demo_rng, f'{period}-demo-{i+1:03}') for i in range(100)]
        labels = search.predict(x(records))
        exported[period] = [{'recordKey':r['record_key'], 'predictedAtRisk':bool(label)} for r,label in zip(records,labels)]
        dashboard_rows.extend([{ 'period':period, **r, 'predicted_at_risk':int(label)} for r,label in zip(records,labels)])
    write_csv('dashboard_input_predictions.csv', dashboard_rows)
    results = {
        'data_status':'Synthetic demonstration only; no real student records or validated institutional predictions.',
        'target':'Whether a fictional student fails at least one subject in the following semester.',
        'seed':SEED, 'sklearn_version':sklearn.__version__, 'features':FEATURES,
        'training_records':len(train), 'test_records':len(test),
        'selection':'Five-fold stratified CV on training data; maximize recall. Scaler fitted separately inside each fold.',
        'best_parameters':search.best_params_, 'cv_recall':search.best_score_,
        'test_metrics':metrics, 'majority_baseline_test_metrics':scores(y(test),baseline.predict(x(test))),
        'confusion_matrix_order':'Rows actual [not at risk, at risk]; columns predicted [not at risk, at risk].',
        'dashboard_predictions':{p:{'assessed':len(records), 'at_risk':sum(r['predictedAtRisk'] for r in records)} for p,records in exported.items()},
    }
    (OUT/'metrics.json').write_text(json.dumps(results, indent=2)+'\n')
    (ROOT/'src/data/riskPredictions.json').write_text(json.dumps({'metadata':results, 'periods':exported}, indent=2)+'\n')
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
