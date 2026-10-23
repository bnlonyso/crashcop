import React, { FC, useState, useMemo, useEffect } from 'react'
import { Rubric } from '@/shared/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Calculator } from '@phosphor-icons/react'
import {
  AssessmentItem,
  calculatePercentage,
  formatPercentage,
} from '@/lib/gradeCalculator'

type HypotheticalRubricCalculatorProps = {
  initialSor: Rubric[]
  initialSoch: Rubric[]
}

const HypotheticalRubricCalculator: FC<HypotheticalRubricCalculatorProps> = ({
  initialSor,
  initialSoch,
}) => {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false)
  const [hasSoch, setHasSoch] = useState(true)

  const hasRealSoch = initialSoch && initialSoch.length > 0
  const hasRealSor = initialSor && initialSor.length > 0

  // Real data transformed into AssessmentItems with guaranteed unique IDs per criterion
  const realSorItems: AssessmentItem[] = useMemo(() => {
    if (hasRealSor) {
      return initialSor.map((r, i) => {
        const maxMark = Math.max(0, Number(r.maxMark) || 0)
        const rawMark = Math.max(0, Number(r.mark) || 0)
        const effectiveMax = maxMark > 0 ? maxMark : (rawMark > 0 ? rawMark : 10)
        return {
          id: r.id ? `sor-${r.id}-${i}` : `sor-init-${i}`,
          title: r.title?.ru || r.title?.kk || `СОР ${i + 1}`,
          mark: Math.min(rawMark, effectiveMax),
          maxMark: effectiveMax,
        }
      })
    }
    // Placeholder if no SOR has been graded yet
    return [
      {
        id: 'sor-pending-0',
        title: 'СОР 1 (еще не выставлен в СУШ)',
        mark: 0,
        maxMark: 20,
      },
    ]
  }, [initialSor, hasRealSor])

  const realSochItems: AssessmentItem[] = useMemo(() => {
    if (hasRealSoch) {
      return initialSoch.map((r, i) => {
        const maxMark = Math.max(0, Number(r.maxMark) || 0)
        const rawMark = Math.max(0, Number(r.mark) || 0)
        const effectiveMax = maxMark > 0 ? maxMark : (rawMark > 0 ? rawMark : 20)
        return {
          id: r.id ? `soch-${r.id}-${i}` : `soch-init-${i}`,
          title: r.title?.ru || r.title?.kk || `СОЧ ${i + 1}`,
          mark: Math.min(rawMark, effectiveMax),
          maxMark: effectiveMax,
        }
      })
    }
    // Placeholder if SOCH has not been conducted yet
    return [
      {
        id: 'soch-pending-0',
        title: 'СОЧ (еще не выставлен / ожидает сдачи)',
        mark: 0,
        maxMark: 20,
      },
    ]
  }, [initialSoch, hasRealSoch])

  // Simulator state synchronized with real data
  const [sorItems, setSorItems] = useState<AssessmentItem[]>(realSorItems)
  const [sochItems, setSochItems] = useState<AssessmentItem[]>(realSochItems)

  useEffect(() => {
    setSorItems(realSorItems)
    setSochItems(realSochItems)
  }, [realSorItems, realSochItems])

  // Calculate actual percentage
  const actualResult = useMemo(() => {
    return calculatePercentage(realSorItems, hasSoch ? realSochItems : [], hasSoch)
  }, [realSorItems, realSochItems, hasSoch])

  // Calculate hypothetical percentage
  const hypotheticalResult = useMemo(() => {
    return calculatePercentage(sorItems, hasSoch ? sochItems : [], hasSoch)
  }, [sorItems, sochItems, hasSoch])

  const handleUpdateSor = (id: string, value: number) => {
    setSorItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              mark: Math.min(item.maxMark, Math.max(0, value)),
            }
          : item,
      ),
    )
  }

  const handleUpdateSoch = (id: string, value: number) => {
    setSochItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              mark: Math.min(item.maxMark, Math.max(0, value)),
            }
          : item,
      ),
    )
  }

  const diff = Math.round((hypotheticalResult.totalPercentage - actualResult.totalPercentage) * 100) / 100

  const activeResult = isSimulatorMode ? hypotheticalResult : actualResult

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Header with Results and Calculator Toggle */}
      <div className="flex items-center justify-between border-b pb-2 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black">
              {formatPercentage(activeResult.totalPercentage)}%
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: activeResult.markColor }}
            >
              Оценка {activeResult.mark}
            </span>
            {isSimulatorMode && diff !== 0 && (
              <span
                className={`text-xs font-semibold shrink-0 ${
                  diff > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {diff > 0 ? `+${formatPercentage(diff)}%` : `${formatPercentage(diff)}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {isSimulatorMode ? 'Прогнозируемый процент (симулятор)' : 'Текущий итоговый процент'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant={isSimulatorMode ? 'secondary' : 'outline'}
            onClick={() => {
              if (isSimulatorMode) {
                setSorItems(realSorItems)
                setSochItems(realSochItems)
              }
              setIsSimulatorMode((prev) => !prev)
            }}
            className={`h-9 px-2.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              isSimulatorMode ? 'bg-primary/20 text-primary border-primary/30 font-semibold' : ''
            }`}
            title={isSimulatorMode ? 'Выйти из симулятора' : 'Симулятор баллов'}
          >
            <Calculator
              size={17}
              className={isSimulatorMode ? 'text-primary' : 'text-muted-foreground'}
            />
            <span className="text-xs hidden sm:inline">
              {isSimulatorMode ? 'Сбросить' : 'Симулятор'}
            </span>
          </Button>
        </div>
      </div>

      <Progress
        value={activeResult.totalPercentage}
        className="h-1.5"
        color={activeResult.markColor}
      />

      {/* Target score advice for upcoming SOCH */}
      {hasSoch && activeResult.pointsNeededFor5 !== null && activeResult.pointsNeededFor5 !== undefined && (
        <div className="rounded-lg bg-purple-950/40 border border-purple-800/50 px-3 py-2 text-xs text-purple-200 flex items-center justify-between gap-2">
          <span>🎯 Для оценки 5 (85%) на СОЧ нужно набрать:</span>
          <strong className="text-white text-xs sm:text-sm shrink-0">
            {activeResult.pointsNeededFor5} из {activeResult.sochMaxMark}
          </strong>
        </div>
      )}

      {hasSoch && activeResult.pointsNeededFor5 === null && activeResult.pointsNeededFor4 !== null && activeResult.pointsNeededFor4 !== undefined && (
        <div className="rounded-lg bg-yellow-950/40 border border-yellow-800/50 px-3 py-2 text-xs text-yellow-200 flex items-center justify-between gap-2">
          <span>🎯 Для оценки 4 (65%) на СОЧ нужно набрать:</span>
          <strong className="text-white text-xs sm:text-sm shrink-0">
            {activeResult.pointsNeededFor4} из {activeResult.sochMaxMark}
          </strong>
        </div>
      )}

      {/* СОР Section */}
      <div className="space-y-2 mt-1">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">СОР</span>
            <span className="text-xs text-muted-foreground">
              (вес: {hasSoch ? '50%' : '100%'})
            </span>
          </div>
          <span>
            {activeResult.sorMark}/{activeResult.sorMaxMark} —{' '}
            <strong className="text-foreground">{formatPercentage(activeResult.sorScore)}%</strong>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {(isSimulatorMode ? sorItems : realSorItems).map((rubric) => (
            <div
              key={rubric.id}
              className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-medium leading-snug break-words flex-1 min-w-0 pr-1">
                  {rubric.title}
                </span>

                {isSimulatorMode ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={rubric.mark}
                      onChange={(e) =>
                        handleUpdateSor(rubric.id, Number(e.target.value))
                      }
                      className="h-7 rounded-md border border-primary/40 bg-background px-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {Array.from({ length: rubric.maxMark + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted-foreground text-xs font-semibold">
                      / {rubric.maxMark}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                    {rubric.mark}/{rubric.maxMark}
                  </span>
                )}
              </div>

              {isSimulatorMode && (
                <input
                  type="range"
                  min={0}
                  max={rubric.maxMark}
                  value={rubric.mark}
                  onChange={(e) =>
                    handleUpdateSor(rubric.id, Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer accent-purple-600 bg-secondary rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* СОЧ Section - Always shown with full detail and toggleability */}
      <div className="space-y-2 mt-3 pt-2 border-t">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">СОЧ</span>
            <Button
              size="sm"
              variant={hasSoch ? 'secondary' : 'outline'}
              onClick={() => setHasSoch((prev) => !prev)}
              className="h-5 px-1.5 text-[10px] rounded"
            >
              {hasSoch ? 'Включен (50%)' : 'Отключен (Без СОЧ)'}
            </Button>
          </div>

          {hasSoch && (
            <span>
              {activeResult.sochMark}/{activeResult.sochMaxMark} —{' '}
              <strong className="text-foreground">{formatPercentage(activeResult.sochScore)}%</strong>
            </span>
          )}
        </div>

        {hasSoch ? (
          <div className="flex flex-col gap-2">
            {(isSimulatorMode ? sochItems : realSochItems).map((rubric) => (
              <div
                key={rubric.id}
                className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                    <span className="text-xs sm:text-sm font-medium leading-snug break-words">
                      {rubric.title}
                    </span>
                    {!hasRealSoch && !isSimulatorMode && (
                      <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                        Ожидает сдачи
                      </span>
                    )}
                  </div>

                  {isSimulatorMode ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={rubric.mark}
                        onChange={(e) =>
                          handleUpdateSoch(rubric.id, Number(e.target.value))
                        }
                        className="h-7 rounded-md border border-primary/40 bg-background px-2 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {Array.from({ length: rubric.maxMark + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground text-xs font-semibold">
                        / {rubric.maxMark}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                      {rubric.mark}/{rubric.maxMark}
                    </span>
                  )}
                </div>

                {isSimulatorMode && (
                  <input
                    type="range"
                    min={0}
                    max={rubric.maxMark}
                    value={rubric.mark}
                    onChange={(e) =>
                      handleUpdateSoch(rubric.id, Number(e.target.value))
                    }
                    className="h-1.5 w-full cursor-pointer accent-purple-600 bg-secondary rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic pl-1">
            СОЧ в этом предмете отключен (оценка формируется на 100% из СОР).
          </p>
        )}
      </div>
    </div>
  )
}

export default HypotheticalRubricCalculator
