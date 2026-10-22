import React, { FC, useState, useMemo } from 'react'
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

  // Real data transformed into AssessmentItems
  const realSorItems: AssessmentItem[] = useMemo(() => {
    return initialSor.map((r, i) => ({
      id: r.id || `sor-init-${i}`,
      title: r.title?.ru || `СОР ${i + 1}`,
      mark: Number(r.mark) || 0,
      maxMark: Number(r.maxMark) || 0,
    }))
  }, [initialSor])

  const realSochItems: AssessmentItem[] = useMemo(() => {
    return initialSoch.map((r, i) => ({
      id: r.id || `soch-init-${i}`,
      title: r.title?.ru || `СОЧ ${i + 1}`,
      mark: Number(r.mark) || 0,
      maxMark: Number(r.maxMark) || 0,
    }))
  }, [initialSoch])

  // Simulator state
  const [sorItems, setSorItems] = useState<AssessmentItem[]>(realSorItems)
  const [sochItems, setSochItems] = useState<AssessmentItem[]>(realSochItems)

  const hasSochInitial = initialSoch.length > 0

  // Calculate actual percentage
  const actualResult = useMemo(() => {
    return calculatePercentage(realSorItems, realSochItems, hasSochInitial)
  }, [realSorItems, realSochItems, hasSochInitial])

  // Calculate hypothetical percentage
  const hypotheticalResult = useMemo(() => {
    return calculatePercentage(sorItems, sochItems, hasSochInitial)
  }, [sorItems, sochItems, hasSochInitial])

  const handleUpdateSor = (id: string, value: number) => {
    setSorItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mark: value } : item)),
    )
  }

  const handleUpdateSoch = (id: string, value: number) => {
    setSochItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mark: value } : item)),
    )
  }

  const diff = Math.round((hypotheticalResult.totalPercentage - actualResult.totalPercentage) * 100) / 100

  const activeResult = isSimulatorMode ? hypotheticalResult : actualResult

  return (
    <div className="flex flex-col gap-3">
      {/* Header with Calculator Icon Button */}
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black">
              {formatPercentage(activeResult.totalPercentage)}%
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: activeResult.markColor }}
            >
              Оценка {activeResult.mark}
            </span>
            {isSimulatorMode && diff !== 0 && (
              <span
                className={`text-xs font-semibold ${
                  diff > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {diff > 0 ? `+${formatPercentage(diff)}%` : `${formatPercentage(diff)}%`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSimulatorMode ? 'Прогнозируемый процент' : 'Текущий итоговый процент'}
          </p>
        </div>

        <Button
          size="icon"
          variant={isSimulatorMode ? 'secondary' : 'outline'}
          onClick={() => {
            if (isSimulatorMode) {
              setSorItems(realSorItems)
              setSochItems(realSochItems)
            }
            setIsSimulatorMode((prev) => !prev)
          }}
          className={`h-9 w-9 rounded-lg transition-colors ${
            isSimulatorMode ? 'bg-primary/20 text-primary border-primary/30' : ''
          }`}
          title={isSimulatorMode ? 'Выйти из симулятора' : 'Симулятор баллов'}
        >
          <Calculator
            size={18}
            className={isSimulatorMode ? 'text-primary' : 'text-muted-foreground'}
          />
        </Button>
      </div>

      <Progress
        value={activeResult.totalPercentage}
        className="h-1.5"
        color={activeResult.markColor}
      />

      {/* СОР Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span className="font-semibold text-foreground">СОР</span>
          <span>
            {activeResult.sorMark}/{activeResult.sorMaxMark} —{' '}
            <strong className="text-foreground">{formatPercentage(activeResult.sorScore)}%</strong>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {(isSimulatorMode ? sorItems : realSorItems).map((rubric) => (
            <div
              key={rubric.id}
              className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs sm:text-sm font-medium">
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
                  <span className="font-semibold text-xs sm:text-sm">
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

      {/* СОЧ Section */}
      {hasSochInitial && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">СОЧ</span>
            <span>
              {activeResult.sochMark}/{activeResult.sochMaxMark} —{' '}
              <strong className="text-foreground">{formatPercentage(activeResult.sochScore)}%</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {(isSimulatorMode ? sochItems : realSochItems).map((rubric) => (
              <div
                key={rubric.id}
                className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-sm transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs sm:text-sm font-medium">
                    {rubric.title}
                  </span>

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
                    <span className="font-semibold text-xs sm:text-sm">
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
        </div>
      )}
    </div>
  )
}

export default HypotheticalRubricCalculator
