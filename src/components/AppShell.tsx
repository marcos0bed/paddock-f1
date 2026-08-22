import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { BuildChip } from './BuildChip'
import { LanguageSwitcher } from './LanguageSwitcher'
import { IconArchive, IconCalendar, IconFlag, IconHome, IconLive, IconTrophy } from './icons'

interface NavItem {
  to: string
  labelKey: string
  Icon: (p: { className?: string }) => ReactNode
}

const HOME: NavItem = { to: '/', labelKey: 'nav.home', Icon: IconHome }
const WEEKEND: NavItem = { to: '/weekend', labelKey: 'nav.weekend', Icon: IconFlag }
const SCHEDULE: NavItem = { to: '/schedule', labelKey: 'nav.schedule', Icon: IconCalendar }
const STANDINGS: NavItem = { to: '/standings', labelKey: 'nav.standings', Icon: IconTrophy }
const SEASONS: NavItem = { to: '/seasons', labelKey: 'nav.seasons', Icon: IconArchive }
const LIVE: NavItem = { to: '/live', labelKey: 'nav.live', Icon: IconLive }

const NAV: NavItem[] = [HOME, WEEKEND, SCHEDULE, STANDINGS, SEASONS, LIVE]

/* Six fits: flex with equal shares, 10px type and 2px side padding — the same
   recipe the other apps on this phone use. A fixed 5-column grid was my
   constraint, not the device's. */
const MOBILE_NAV: NavItem[] = NAV

function Brand() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2.5">
      {/* Three angled bars — a speed mark, not a logo we don't own */}
      <span className="flex h-7 items-center gap-[3px]" aria-hidden>
        <span className="block h-7 w-[3px] -skew-x-12 bg-speed" />
        <span className="block h-5 w-[3px] -skew-x-12 bg-speed/60" />
        <span className="block h-3 w-[3px] -skew-x-12 bg-speed/30" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-700 tracking-wide text-ink uppercase">
          {t('app.name')}
        </span>
        <span className="mt-0.5 text-[0.55rem] tracking-[0.2em] text-ink-faint uppercase">
          {t('app.tagline')}
        </span>
      </span>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface/60 px-5 py-6 backdrop-blur lg:flex">
        <div className="flex items-start justify-between gap-3">
          <Brand />
          <LanguageSwitcher compact />
        </div>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-speed bg-surface-2 text-ink'
                    : 'border-transparent text-ink-dim hover:border-line-bright hover:bg-surface-2/50 hover:text-ink'
                }`
              }
            >
              <span className="h-[1.15rem] w-[1.15rem] shrink-0">
                <Icon />
              </span>
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile header */}
        {/* pt-[safe-area] keeps the header clear of the Dynamic Island when
            the PWA runs standalone (no browser chrome to push it down). */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <Brand />
          <div className="flex items-center gap-3">
            <BuildChip />
            <LanguageSwitcher />
          </div>
        </header>

        {/* min-h-dvh is load-bearing on iOS, not cosmetic: on pages shorter
            than the screen, the rubber-band overscroll in a standalone PWA
            leaves position:fixed elements (the tab bar) visibly displaced.
            Guaranteeing no page is shorter than the viewport avoids it. */}
        <main className="min-h-dvh min-w-0 flex-1 pb-28 lg:min-h-0 lg:pb-10">{children}</main>

        {/* Mobile tab bar.
            The compositing hints below are proven on this exact phone by the
            other PWAs installed on it: a fixed bar with backdrop-filter needs
            its own layer or it jitters during momentum scrolling. They are not
            what broke tapping — stale code chunks were. */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
          style={{
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
          aria-label={t('nav.home')}
        >
          {MOBILE_NAV.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                // min-h-11 ≈ 44px, Apple's minimum comfortable tap target
                `flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden px-[2px] py-2.5 text-[0.6rem] font-semibold tracking-wide whitespace-nowrap uppercase transition ${
                  isActive ? 'text-speed' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative h-5 w-5">
                    <Icon />
                    {isActive && (
                      <span className="absolute -top-2.5 left-1/2 h-[2px] w-6 -translate-x-1/2 bg-speed" />
                    )}
                  </span>
                  {t(labelKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

/** Page wrapper: consistent gutters and a display-type header. */
export function Page({
  title,
  eyebrow,
  action,
  children,
}: {
  title?: string
  eyebrow?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
      {(title || eyebrow) && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
            {title && (
              <h1 className="font-display text-4xl font-700 tracking-tight text-ink uppercase lg:text-5xl">
                {title}
              </h1>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
