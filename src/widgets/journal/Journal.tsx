import React, { FC, useMemo } from 'react'
import { type Journal } from '@/shared/types'
import JournalElement from '@/widgets/journal/JournalElement'
import JournalNotFound from '@/widgets/journal/JournalNotFound'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'
import { useJournal } from '@/lib/hooks/useJournal'

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

  // Collect all known subjects strictly across all quarters of the current school year's journal
  // Never pull from report cards to avoid showing subjects from past grades (e.g. 11th grade)
  const allMasterSubjects = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: { ru: string; kk: string; en: string } }
    >()

    if (allQuarters && Array.isArray(allQuarters)) {
      for (const q of allQuarters) {
        for (const subj of q.subjects || []) {
          if (subj.id && !map.has(subj.id)) {
            map.set(subj.id, { id: subj.id, name: subj.name })
          }
        }
      }
    }

    return map
  }, [allQuarters])

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
