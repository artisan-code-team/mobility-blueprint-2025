/**
 * Whether the exercise timer sounds its completion chime, persisted locally.
 *
 * This is the app's first browser-persisted preference, so it also sets the
 * convention: an `mb:`-namespaced localStorage key, a safe default when storage is
 * unavailable, and never throwing at the call site. Storage access throws outright
 * in Safari private mode, and reads must never run during render — they would
 * differ between the server and client pass and trip a hydration mismatch.
 */

const SOUND_ENABLED_KEY = 'mb:timer-sound'

/**
 * Reads the stored preference. Returns true — sound on — when storage is
 * unavailable or nothing has been stored yet.
 */
export function readSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true

  try {
    return window.localStorage.getItem(SOUND_ENABLED_KEY) !== 'off'
  } catch (error) {
    console.warn('Could not read sound preference:', error)
    return true
  }
}

/** Persists the preference. A failure to store is not worth interrupting the user for. */
export function writeSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'on' : 'off')
  } catch (error) {
    console.warn('Could not save sound preference:', error)
  }
}
