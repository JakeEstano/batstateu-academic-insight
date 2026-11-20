"""Check exported evidence independently of model fitting."""
import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / 'analytics/outputs'
paths = [out / name for name in ('synthetic_training_data.csv', 'held_out_predictions.csv', 'metrics.json')]
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
print('PASS: deterministic regeneration; disjoint train/test records; independently recomputed held-out metrics.')
