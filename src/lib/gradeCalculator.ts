export interface AssessmentItem {
  id: string
  title: string
  mark: number
  maxMark: number
}

export interface CalculationResult {
  sorMark: number
  sorMaxMark: number
  sorScore: number // in percent
  sochMark: number
  sochMaxMark: number
  sochScore: number // in percent
  totalPercentage: number
  mark: number // 2, 3, 4, 5
  markColor: string
  pointsNeededFor5?: number | null
  pointsNeededFor4?: number | null
}

export const getMarkFromScore = (percentage: number): number => {
  if (percentage >= 85) return 5
  if (percentage >= 65) return 4
  if (percentage >= 40) return 3
  return 2
}

export const getColorByScore = (score: number): string => {
  if (score < 40) return '#ef4444' // red-500
  if (score < 65) return '#f97316' // orange-500
  if (score < 85) return '#eab308' // yellow-500
  return '#22c55e' // green-500
}

export const calculatePercentage = (
  sorList: AssessmentItem[],
  sochList: AssessmentItem[],
  hasSoch: boolean = true,
): CalculationResult => {
  const sorMark = sorList.reduce((acc, item) => acc + (Number(item.mark) || 0), 0)
  const sorMaxMark = sorList.reduce((acc, item) => acc + (Number(item.maxMark) || 0), 0)

  const sochMark = sochList.reduce((acc, item) => acc + (Number(item.mark) || 0), 0)
  const sochMaxMark = sochList.reduce((acc, item) => acc + (Number(item.maxMark) || 0), 0)

  const sorWeight = hasSoch ? 0.5 : 1.0
  const sochWeight = hasSoch ? 0.5 : 0.0

  const sorScore = sorMaxMark > 0
    ? parseFloat(((sorMark / sorMaxMark) * sorWeight * 100).toFixed(2))
    : 0

  const sochScore = hasSoch && sochMaxMark > 0
    ? parseFloat(((sochMark / sochMaxMark) * sochWeight * 100).toFixed(2))
    : 0

  const totalPercentage = parseFloat((sorScore + sochScore).toFixed(2))
  const mark = getMarkFromScore(totalPercentage)
  const markColor = getColorByScore(totalPercentage)

  let pointsNeededFor5: number | null = null
  let pointsNeededFor4: number | null = null

  if (hasSoch && sochMaxMark > 0) {
    // sorScore + (x / sochMaxMark) * 50 >= 85
    const needed5 = Math.ceil(((85 - sorScore) / (sochWeight * 100)) * sochMaxMark)
    pointsNeededFor5 = needed5 <= sochMaxMark ? Math.max(0, needed5) : null

    const needed4 = Math.ceil(((65 - sorScore) / (sochWeight * 100)) * sochMaxMark)
    pointsNeededFor4 = needed4 <= sochMaxMark ? Math.max(0, needed4) : null
  }

  return {
    sorMark,
    sorMaxMark,
    sorScore,
    sochMark,
    sochMaxMark,
    sochScore,
    totalPercentage,
    mark,
    markColor,
    pointsNeededFor5,
    pointsNeededFor4,
  }
}
