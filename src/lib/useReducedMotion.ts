import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  // Assume reduced motion before hydration so nothing animates unexpectedly.
  return true
}

/**
 * Tracks the OS "reduce motion" preference and stays in sync if the user
 * changes it mid-session. Every scroll-linked effect in this system checks
 * this first and degrades to a static, fully-visible state.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
