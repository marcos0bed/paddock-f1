import { useQuery } from '@tanstack/react-query'

import * as openf1 from '../lib/api/openf1'
import { OpenF1RestrictedError } from '../lib/api/openf1'
import type { OpenF1Session } from '../lib/api/types'

export type SessionState = 'done' | 'live' | 'upcoming'

/** Results of a finished session never change — cache them hard. */
const FINISHED = { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 }

function noRetryWhenRestricted(failureCount: number, error: unknown) {
  if (error instanceof OpenF1RestrictedError) return false
  return failureCount < 2
}

export function sessionState(session: OpenF1Session, now = Date.now()): SessionState {
  const start = new Date(session.date_start).getTime()
  const end = new Date(session.date_end).getTime()
  if (now < start) return 'upcoming'
  if (now > end) return 'done'
  return 'live'
}

/** Broad session type, which decides how its results should be read. */
export function resultShape(session: OpenF1Session): 'practice' | 'qualifying' | 'race' {
  const type = (session.session_type ?? '').toLowerCase()
  if (type.includes('practice')) return 'practice'
  if (type.includes('qualif')) return 'qualifying'
  return 'race'
}

export function useWeekend() {
  const meeting = useQuery({
    queryKey: ['weekend', 'meeting'],
    queryFn: openf1.getLatestMeeting,
    staleTime: 10 * 60 * 1000,
    retry: noRetryWhenRestricted,
  })

  const sessions = useQuery({
    queryKey: ['weekend', 'sessions'],
    queryFn: () => openf1.getMeetingSessions('latest'),
    staleTime: 10 * 60 * 1000,
    retry: noRetryWhenRestricted,
  })

  const meetingKey = meeting.data?.meeting_key
  const drivers = useQuery({
    queryKey: ['weekend', 'drivers', meetingKey],
    queryFn: () => openf1.getMeetingDrivers(meetingKey!),
    enabled: meetingKey != null,
    staleTime: 60 * 60 * 1000,
    retry: noRetryWhenRestricted,
  })

  const restricted = [meeting.error, sessions.error, drivers.error].some(
    (e) => e instanceof OpenF1RestrictedError,
  )

  return {
    meeting: meeting.data ?? null,
    sessions: sessions.data ?? [],
    driversByNumber: new Map((drivers.data ?? []).map((d) => [d.driver_number, d])),
    isLoading: meeting.isLoading || sessions.isLoading,
    restricted,
    error: meeting.error ?? sessions.error,
    refetch: () => {
      void meeting.refetch()
      void sessions.refetch()
    },
  }
}

/**
 * Results for one session, fetched only once its row is opened. The free tier
 * allows 3 requests/second, so loading all five sessions up front would risk a
 * 429 for data the user may never look at.
 */
export function useSessionResult(sessionKey: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['weekend', 'result', sessionKey],
    queryFn: () => openf1.getSessionResult(sessionKey!),
    enabled: enabled && sessionKey != null,
    ...FINISHED,
    retry: noRetryWhenRestricted,
  })
}
