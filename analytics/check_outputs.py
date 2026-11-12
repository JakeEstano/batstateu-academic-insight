"""Check exported evidence independently of model fitting."""
import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / 'analytics/outputs'
paths = sorted(out.glob('*')) + [root / 'src/data/riskPredictions.json']
before = {str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
subprocess.run([sys.executable, str(root/'analytics/train_knn.py')], check=True, stdout=subprocess.DEVNULL)
assert before == {str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}, 'Outputs are not reproducible'
read = lambda name:list(csv.DictReader((out/name).open()))
rows = read('synthetic_training_data.csv')
train = {r['record_key'] for r in rows if r['split']=='train'}
test = {r['record_key'] for r in rows if r['split']=='test'}
assert len(train)==800 and len(test)==200 and not train & test
held = read('held_out_predictions.csv')
assert {r['record_key'] for r in held}==test
cm = [[0,0],[0,0]]
for r in held:
    cm[int(r['failed_next_semester'])][int(r['predicted_at_risk'])] += 1
metrics = json.loads((out/'metrics.json').read_text())
assert cm == metrics['test_metrics']['confusion_matrix']
tn,fp,fn,tp = cm[0][0],cm[0][1],cm[1][0],cm[1][1]
assert metrics['test_metrics']['precision']==tp/(tp+fp)
assert metrics['test_metrics']['recall']==tp/(tp+fn)
export = json.loads((root/'src/data/riskPredictions.json').read_text())
demo = read('dashboard_input_predictions.csv')
assert not ({r['record_key'] for r in demo} & (train|test))
assert len({r['record_key'] for r in demo})==400
for period, records in export['periods'].items():
    matching = [r for r in demo if r['period']==period]
    assert len(records)==len(matching)==100
    assert sum(r['predictedAtRisk'] for r in records)==sum(int(r['predicted_at_risk']) for r in matching)
    assert all(a['recordKey']==b['record_key'] and a['predictedAtRisk']==bool(int(b['predicted_at_risk'])) for a,b in zip(records,matching))
print('PASS: deterministic regeneration; disjoint train/test/inference records; independently recomputed metrics; dashboard predictions reconcile for all four periods.')
