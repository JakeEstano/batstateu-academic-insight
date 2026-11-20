"""Render verified synthetic KNN results as a one-page PDF and PNG evidence image."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'analytics' / 'outputs'
metrics = json.loads((OUT / 'metrics.json').read_text())
score = metrics['test_metrics']
cm = score['confusion_matrix']
W, H = 1400, 900
ops = []

def color(hex_color):
    h = hex_color.lstrip('#')
    return ' '.join(f'{int(h[i:i+2], 16)/255:.3f}' for i in (0, 2, 4))

def box(x, top, w, h, fill):
    ops.append(f'{color(fill)} rg {x} {H-top-h} {w} {h} re f')

def text(value, x, top, size=20, bold=False, fill='#171923'):
    value = str(value).encode('ascii', 'replace').decode('ascii')
    value = value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    ops.append(f'{color(fill)} rg BT /F{2 if bold else 1} {size} Tf {x} {H-top-size} Td ({value}) Tj ET')

box(0, 0, W, H, '#F5F6F9')
box(55, 45, 1290, 810, '#FFFFFF')
box(55, 45, 9, 810, '#B91C1C')
text('MODEL TRAINING RESULTS', 100, 80, 17, True, '#B91C1C')
text('Synthetic student-risk classification', 100, 116, 36, True)
text('K-nearest neighbors  |  Standalone case-study exercise', 100, 174, 19, fill='#667085')
box(100, 230, 1198, 112, '#F5F6F9')
text('TRAINING DATA', 124, 248, 15, True, '#667085')
text('1,000 fictional records', 124, 276, 26, True)
text('800 training  /  200 held-out test', 590, 276, 26, True)
for i, (label, key) in enumerate([('ACCURACY', 'accuracy'), ('PRECISION', 'precision'), ('RECALL', 'recall'), ('F1 SCORE', 'f1')]):
    x = 100 + i*306
    box(x, 373, 280, 138, '#FFF3F3' if key == 'recall' else '#F5F6F9')
    text(label, x+20, 393, 15, True, '#667085')
    text(f'{score[key]:.1%}', x+20, 425, 43, True)
text('MODEL SETUP', 100, 548, 16, True, '#B91C1C')
params = metrics['best_parameters']
text(f"k = {params['knn__n_neighbors']}  |  {params['knn__weights']} weights  |  5-fold stratified cross-validation", 100, 581, 23, True)
text('Inputs: previous average grade, attendance, previous failed subjects, assignment completion', 100, 625, 18, fill='#667085')
box(100, 676, 1198, 1, '#E3E5EA')
text('HELD-OUT CONFUSION MATRIX', 100, 701, 16, True, '#B91C1C')
text(f'Correct: {cm[0][0]} not at risk, {cm[1][1]} at risk.  Errors: {cm[0][1]} false positives, {cm[1][0]} false negatives.', 100, 733, 19, True)
text('Synthetic demonstration only. 54% recall is insufficient for dependable real-world screening.', 100, 801, 16, fill='#667085')
stream = '\n'.join(ops).encode('ascii')
objects = [
    b'<< /Type /Catalog /Pages 2 0 R >>',
    b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {W} {H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'.encode(),
    b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    f'<< /Length {len(stream)} >>\nstream\n'.encode() + stream + b'\nendstream',
]
pdf = bytearray(b'%PDF-1.4\n')
offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf += f'{i} 0 obj\n'.encode() + obj + b'\nendobj\n'
xref = len(pdf)
pdf += f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode()
for pos in offsets[1:]:
    pdf += f'{pos:010d} 00000 n \n'.encode()
pdf += f'trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
pdf_path = OUT / 'model-results.pdf'
image_path = OUT / 'model-results.png'
pdf_path.write_bytes(pdf)
subprocess.run(['sips', '-s', 'format', 'png', str(pdf_path), '--out', str(image_path)], check=True, stdout=subprocess.DEVNULL)
print(image_path)
