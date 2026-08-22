import { useState } from 'react'

/**
 * Shows which build is actually running, and force-updates on tap.
 *
 * An installed iOS PWA can keep serving a cached build across launches, so
 * without this there's no way to tell a broken fix from a stale one. Tapping
 * unregisters the service worker, drops every cache and reloads — the escape
 * hatch for exactly that situation.
 */
export function BuildChip() {
  const [busy, setBusy] = useState(false)

  async function forceUpdate() {
    if (busy) return
    setBusy(true)
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch {
      /* Best effort — reload regardless. */
    }
    location.reload()
  }

  return (
    <button
      type="button"
      onClick={() => void forceUpdate()}
      title="Tap to force update"
      className="font-mono text-[0.6rem] tracking-wider text-ink-faint tabular-nums transition active:text-speed"
    >
      {busy ? '…' : __BUILD_ID__}
    </button>
  )
}
