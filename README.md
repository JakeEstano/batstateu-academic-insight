# Acadence

Single-page academic monitoring and teaching-effectiveness dashboard for a BSIT Program Chair, created for a BAT 405 case study. All academic records are illustrative. The separate KNN exercise uses synthetic records and does not feed the dashboard.

## Development

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:8443. Run `npx tsc --noEmit` and `npm run build` to validate changes.

## Free hosting

GitHub Pages publishes the `dist` output using `.github/workflows/deploy.yml` after a push to `main`. In repository Settings → Pages, select GitHub Actions as the source. The workflow sets the Vite base path for the repository name. Python is not needed by the hosted dashboard.

## Machine learning evidence

See [the Part IV walkthrough](analytics/README.md) for the dataset, seven modeling steps, reproducible training instructions, measured evaluation results, and limitations. The KNN exercise is not validated for real student screening or automated academic decisions. The displayed access scope is a demonstration, not production authentication.
