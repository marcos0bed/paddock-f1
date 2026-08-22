/* Inline SVGs — a handful of glyphs isn't worth an icon dependency, and these
   inherit currentColor so they follow team accents for free. */

type Props = { className?: string }

const base = 'h-full w-full'

export function IconHome({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCalendar({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrophy({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" strokeLinejoin="round" />
      <path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11" strokeLinecap="round" />
      <path d="M12 15v3.5M8.5 20.5h7" strokeLinecap="round" />
    </svg>
  )
}

export function IconHelmet({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3.2 13.5a8.8 8.8 0 1 1 17.5-1.2c0 1-.2 1.7-1.2 1.9l-8.2 1.6" strokeLinecap="round" />
      <path d="M3.4 13.6c1.6 3.6 5 5.4 8.6 5.4h6.4a2 2 0 0 0 2-2v-1.4" strokeLinecap="round" />
      <path d="M4.6 10.4h9.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCar({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M2.5 14.5h3l2-3h6l2.5 3h5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 14.5V17h19v-2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </svg>
  )
}

export function IconLive({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4" strokeLinecap="round" />
      <path d="M5 5a10 10 0 0 0 0 14M19 19a10 10 0 0 0 0-14" strokeLinecap="round" />
    </svg>
  )
}

export function IconArchive({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3.5" y="4.5" width="17" height="4" rx="1" />
      <path d="M5 8.5v10a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-10" strokeLinecap="round" />
      <path d="M10 12.5h4" strokeLinecap="round" />
    </svg>
  )
}

export function IconGlobe({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
    </svg>
  )
}

export function IconChevron({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconFlag({ className = base }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M5 21V4M5 4h13l-2.5 4L18 12H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
