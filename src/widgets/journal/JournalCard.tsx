import React, { FC } from 'react'
import { cn } from '@/lib/utils'
import classes from '@/widgets/journal/journal.module.scss'
import { formatPercentage } from '@/lib/gradeCalculator'

const getColor = (score: number): { primary: string; bg: string } => {
  if (score <= 0) return { primary: '#94a3b8', bg: '#94a3b830' } // neutral gray for 0%
  if (score < 65) return { primary: '#ff3a27', bg: '#ff3a2740' }
  if (score < 85) return { primary: '#fca40c', bg: '#fca40c40' }
  return { primary: '#1bd90d', bg: '#1bd90d40' }
}

const getMarkColor = (mark: number): string => {
  if (!mark) return '#94a3b8'
  if (mark < 4) return '#ff3a27'
  if (mark < 5) return '#fca40c'
  return '#1bd90d'
}

type JournalCardProps = {
  subject: string
  currentScore: number
  mark?: number
}

const JournalCard: FC<JournalCardProps> = ({ subject, mark, currentScore }) => {
  const scoreColor = getColor(currentScore)
  const markTextColor = getMarkColor(mark!)

  const scoreBarStyle = {
    background: currentScore > 0
      ? `linear-gradient(to right, ${scoreColor.primary} ${currentScore}%, ${scoreColor.bg} ${currentScore}%)`
      : '#27272a',
  }

  return (
    <div
      className={cn(
        'my-2.5 h-fit min-h-24 flex-col overflow-hidden rounded-xl bg-card border border-border/80 shadow transition-all hover:border-primary/50 hover:text-primary dark:shadow-none cursor-pointer',
        classes.card,
      )}
    >
      <div className="px-4 py-3">
        <h2
          className={cn(
            'w-full scroll-m-20 text-lg sm:text-xl font-semibold break-words leading-snug',
            classes.subject,
          )}
        >
          {subject}
        </h2>
        <div className="mt-2 flex flex-row items-baseline justify-between gap-2">
          <h3
            className="scroll-m-20 text-2xl font-bold tracking-tight"
            style={{ color: scoreColor.primary }}
          >
            {formatPercentage(currentScore)}%
          </h3>
          {mark && mark > 0 && (
            <h3
              className="scroll-m-20 text-2xl tracking-tight"
              style={{ color: markTextColor }}
            >
              <span className="text-xl text-muted-foreground">оценка: </span>
              {mark}
            </h3>
          )}
        </div>
      </div>

      <div
        className="relative bottom-0 h-[4px] w-full overflow-hidden rounded-b-xl"
        style={scoreBarStyle}
      ></div>
    </div>
  )
}

export default JournalCard
