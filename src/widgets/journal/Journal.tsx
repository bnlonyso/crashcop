import React, { FC, useMemo } from 'react'
import { type Journal } from '@/shared/types'
import JournalElement from '@/widgets/journal/JournalElement'
import JournalNotFound from '@/widgets/journal/JournalNotFound'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'
import { useJournal } from '@/lib/hooks/useJournal'
import { useReports } from '@/lib/hooks/useReports'

type JournalProps = {
  journal: Journal[number]
}

const compareFunction =
  (sort: string) =>
  (
    a: Journal[number]['subjects'][number],
    b: Journal[number]['subjects'][number],
  ) => {
    switch (sort) {
      case 'asc':
        return a.name.ru.localeCompare(b.name.ru)
      case 'score-up':
        return a.currScore - b.currScore
      default:
        return b.currScore - a.currScore
    }
  }

const JournalList: FC<JournalProps> = ({ journal }) => {
  const sort = useSettingsStore((state) => state.sort)
  const { data: allQuarters } = useJournal()
  const { data: reports } = useReports()

  // Collect all known subjects across all quarters and report card
  const allMasterSubjects = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: { ru: string; kk: string; en: string } }
    >()

    // 1. From all quarters
    if (allQuarters && Array.isArray(allQuarters)) {
      for (const q of allQuarters) {
        for (const subj of q.subjects || []) {
          if (subj.id && !map.has(subj.id)) {
            map.set(subj.id, { id: subj.id, name: subj.name })
          }
        }
      }
    }

    // 2. From annual report cards
    if (reports && Array.isArray(reports)) {
      for (const report of reports) {
        for (const item of report.reportCard || []) {
          if (item.subject?.id && !map.has(item.subject.id)) {
            map.set(item.subject.id, {
              id: item.subject.id,
              name: item.subject.name,
            })
          }
        }
      }
    }

    return map
  }, [allQuarters, reports])

  // Merge subjects so all subjects appear even if they currently have 0% / no grades yet
  const fullSubjectList = useMemo(() => {
    const existingMap = new Map<string, Journal[number]['subjects'][number]>()
    for (const subj of journal.subjects || []) {
      existingMap.set(subj.id, subj)
    }

    const combined: Journal[number]['subjects'][number][] = [
      ...(journal.subjects || []),
    ]

    for (const [id, masterSubj] of allMasterSubjects.entries()) {
      if (!existingMap.has(id)) {
        combined.push({
          id,
          name: masterSubj.name,
          currScore: 0,
          mark: undefined,
        })
      }
    }

    return combined.sort(compareFunction(sort))
  }, [journal.subjects, allMasterSubjects, sort])

  return (
    <>
      {fullSubjectList.length > 0 ? (
        fullSubjectList.map((subject, index) => (
          <JournalElement
            key={`journal-element-${subject.id}-${index}`}
            subject={subject.name.ru || subject.name.kk || 'Предмет'}
            subjectId={subject.id}
            quarter={journal.number.toString()}
            currentScore={subject.currScore}
            mark={subject.mark}
          />
        ))
      ) : (
        <JournalNotFound description="По данной четверти информации не найдено" />
      )}
    </>
  )
}

export default JournalList
