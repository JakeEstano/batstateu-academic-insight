import trainedOutput from "./riskPredictions.json"

// Actual KNN outputs on fictional records. No real student data is used.
export type RiskPrediction = { recordKey: string; predictedAtRisk: boolean }
export const riskModel = trainedOutput.metadata

export function modelPredictions(periodId: string): RiskPrediction[] {
  const periods: Record<string, RiskPrediction[]> = trainedOutput.periods
  const predictions = periods[periodId]
  if (!predictions) throw new Error(`Missing model predictions for ${periodId}`)
  return predictions
}

export function summarizeRisk(predictions: readonly RiskPrediction[]) {
  return {
    assessed: predictions.length,
    atRisk: predictions.filter((record) => record.predictedAtRisk).length,
  }
}
