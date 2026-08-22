import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type Language } from '../i18n'
import { IconGlobe } from './icons'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = (i18n.resolvedLanguage ?? 'en') as Language

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('a11y.changeLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 border border-line bg-surface px-3 py-2 text-xs font-semibold tracking-wider text-ink-dim uppercase transition hover:border-line-bright hover:text-ink"
      >
        <span className="h-3.5 w-3.5">
          <IconGlobe />
        </span>
        {!compact && <span>{active}</span>}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.label')}
          className="absolute right-0 z-50 mt-1 min-w-[10rem] border border-line-bright bg-surface-2 py-1 shadow-2xl shadow-black/60"
        >
          {SUPPORTED_LANGUAGES.map((lng) => (
            <li key={lng}>
              <button
                type="button"
                role="option"
                aria-selected={lng === active}
                onClick={() => {
                  void i18n.changeLanguage(lng)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-3 ${
                  lng === active ? 'text-signal' : 'text-ink-dim'
                }`}
              >
                <span>{LANGUAGE_LABELS[lng]}</span>
                <span className="font-mono text-[0.65rem] tracking-widest uppercase opacity-60">
                  {lng}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
