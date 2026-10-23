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
  // Sanitize and normalize items: mark cannot exceed maxMark
  let sorMark = 0
  let sorMaxMark = 0
  for (const item of sorList) {
    const rawMax = Math.max(0, Number(item.maxMark) || 0)
    const rawMark = Math.max(0, Number(item.mark) || 0)
    const maxMark = rawMax > 0 ? rawMax : rawMark
    const mark = maxMark > 0 ? Math.min(rawMark, maxMark) : 0
    sorMark += mark
    sorMaxMark += maxMark
  }

  let sochMark = 0
  let sochMaxMark = 0
  for (const item of sochList) {
    const rawMax = Math.max(0, Number(item.maxMark) || 0)
    const rawMark = Math.max(0, Number(item.mark) || 0)
    const maxMark = rawMax > 0 ? rawMax : rawMark
    const mark = maxMark > 0 ? Math.min(rawMark, maxMark) : 0
    sochMark += mark
    sochMaxMark += maxMark
  }

  const actuallyHasSoch = hasSoch && sochList.length > 0 && sochMaxMark > 0
  const sorWeight = actuallyHasSoch ? 0.5 : 1.0
  const sochWeight = actuallyHasSoch ? 0.5 : 0.0

  const rawSorScore = sorMaxMark > 0
    ? ((sorMark / sorMaxMark) * sorWeight * 100)
    : 0
  const sorScore = Math.min(
    sorWeight * 100,
    Math.max(0, Math.round(rawSorScore * 100) / 100),
  )

  const rawSochScore = actuallyHasSoch && sochMaxMark > 0
    ? ((sochMark / sochMaxMark) * sochWeight * 100)
    : 0
  const sochScore = Math.min(
    sochWeight * 100,
    Math.max(0, Math.round(rawSochScore * 100) / 100),
  )

  // Clamp total percentage between 0 and 100%
  const totalPercentage = Math.min(
    100,
    Math.max(0, Math.round((sorScore + sochScore) * 100) / 100),
  )
  const mark = getMarkFromScore(totalPercentage)
  const markColor = getColorByScore(totalPercentage)

  let pointsNeededFor5: number | null = null
  let pointsNeededFor4: number | null = null

  if (actuallyHasSoch && sochMaxMark > 0) {
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
