import React, { FC, useState, useMemo } from 'react'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReportCard } from '@/shared/types'
import { Calculator, ArrowCounterClockwise } from '@phosphor-icons/react'

interface Props {
  reportCard: ReportCard[number]
}

const HypotheticalGradesModal: FC<Props> = ({ reportCard }) => {
  const [hypothetical, setHypothetical] = useState<Record<string, number>>({})

  const handleChange = (subjectId: string, value: string) => {
    const num = Number(value)
    if (!isNaN(num) && value !== '') {
      setHypothetical((prev) => ({ ...prev, [subjectId]: num }))
    } else {
      setHypothetical((prev) => {
        const copy = { ...prev }
        delete copy[subjectId]
        return copy
      })
    }
  }

  const handleReset = () => {
    setHypothetical({})
  }

  const projectedGPA = useMemo(() => {
    let sum = 0
    let count = 0
    reportCard.reportCard.forEach((r) => {
      const id = r.subject.id
      const mark = hypothetical[id] ?? Number(r.yearMark?.ru)
      if (!isNaN(mark)) {
        sum += mark
        count++
      }
    })
    return count ? sum / count : 0
  }, [hypothetical, reportCard])

  const actualGPA = useMemo(() => {
    let sum = 0
    let count = 0
    reportCard.reportCard.forEach((r) => {
      const mark = Number(r.yearMark?.ru)
      if (!isNaN(mark)) {
        sum += mark
        count++
      }
    })
    return count ? sum / count : 0
  }, [reportCard])

  const diff = (projectedGPA - actualGPA).toFixed(2)

  return (
    <ResponsiveModal
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-xs"
        >
          <Calculator size={16} className="text-primary" />
          <span>Симулятор GPA</span>
        </Button>
      }
      title={
        <div className="flex items-center gap-2 text-2xl font-black">
          <Calculator size={28} className="text-primary" />
          <span>Симулятор годового GPA</span>
        </div>
      }
      description="Измените годовые оценки по предметам, чтобы спрогнозировать итоговый средний балл (GPA)."
      close={<Button variant="outline">Закрыть</Button>}
    >
      <div className="flex flex-col gap-3 py-2 max-h-[70vh] overflow-y-auto px-1">
        <div className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Прогнозируемый GPA
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                {projectedGPA ? projectedGPA.toFixed(2) : 'Н/Д'}
              </span>
              {Number(diff) !== 0 && (
                <span
                  className={`text-xs font-bold ${
                    Number(diff) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {Number(diff) > 0 ? `+${diff}` : diff}
                </span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowCounterClockwise size={14} className="mr-1" />
            Сброс
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          {reportCard.reportCard.map((r) => {
            const currentVal = hypothetical[r.subject.id] !== undefined
              ? hypothetical[r.subject.id]
              : (r.yearMark?.ru ?? '')

            return (
              <div
                key={r.subject.id}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <span className="max-w-[70%] truncate font-medium">
                  {r.subject.name.ru}
                </span>
                <Input
                  type="number"
                  min="2"
                  max="5"
                  step="1"
                  value={currentVal}
                  placeholder={r.yearMark?.ru || '-'}
                  className="h-8 w-16 text-center text-sm font-bold"
                  onChange={(e) => handleChange(r.subject.id, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default HypotheticalGradesModal
