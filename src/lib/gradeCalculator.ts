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

export const formatPercentage = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '0'
  const num = Number(val)
  if (isNaN(num)) return '0'
  const rounded = Math.round(num * 100) / 100
  return String(rounded)
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
    ? Math.round(((sorMark / sorMaxMark) * sorWeight * 100) * 100) / 100
    : 0

  const sochScore = hasSoch && sochMaxMark > 0
    ? Math.round(((sochMark / sochMaxMark) * sochWeight * 100) * 100) / 100
    : 0

  const totalPercentage = Math.round((sorScore + sochScore) * 100) / 100
  const mark = getMarkFromScore(totalPercentage)
  const markColor = getColorByScore(totalPercentage)

  let pointsNeededFor5: number | null = null
  let pointsNeededFor4: number | null = null

  if (hasSoch && sochMaxMark > 0) {
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
