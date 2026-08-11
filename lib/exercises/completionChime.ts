/**
 * The exercise timer's completion chime — a struck singing bowl synthesised with
 * the Web Audio API, so there is no audio asset to ship, license, or cache.
 *
 * The chime is *pre-scheduled* rather than played on demand. The timer's countdown
 * runs on requestAnimationFrame, which browsers throttle or pause when the tab is
 * backgrounded, so reacting to the countdown reaching zero would sound the chime
 * late — precisely when the user is least able to watch the screen. The Web Audio
 * clock runs on its own thread, independent of rAF and the main thread, so a chime
 * scheduled at start time sounds on the beat whether or not the UI is still ticking.
 *
 * Caveat this cannot solve: if the browser suspends the AudioContext outright
 * (typically iOS with the screen locked), nothing scheduled will sound. Callers
 * should keep their own deadline and call playNow() on return to the foreground.
 */

/** Total ring-out, in seconds, from the first strike to silence. */
export const CHIME_DURATION_SECONDS = 10

/** Peak output of the whole chime. Deliberately gentle — this often plays on headphones. */
const MASTER_GAIN = 0.3

/** Rounds off the digital edge of the upper partials. */
const LOWPASS_HZ = 3200

/** Ramp in over a few milliseconds so the strike doesn't start with a click. */
const ATTACK_SECONDS = 0.006

/** exponentialRampToValueAtTime cannot reach 0, so decays land here instead. */
const SILENCE = 0.0001

const DEFAULT_FUNDAMENTAL_HZ = 466.16

/**
 * One component tone of a strike. Real bells are inharmonic — their partials sit at
 * irrational-ish ratios rather than integer harmonics, and the high ones fade much
 * faster than the low ones. That decay gradient is what the ear hears as "bell"
 * rather than "beep", so `decay` matters as much as `ratio` here.
 */
interface ChimePartial {
  ratio: number
  gain: number
  decaySeconds: number
}

const PARTIALS: ChimePartial[] = [
  { ratio: 0.5, gain: 0.55, decaySeconds: 10 }, // hum — the long tail under everything
  { ratio: 1, gain: 1, decaySeconds: 8.5 }, // prime
  { ratio: 1.19, gain: 0.42, decaySeconds: 4.5 }, // tierce, the bell's minor-third colour
  { ratio: 1.5, gain: 0.26, decaySeconds: 3 }, // quint
  { ratio: 2, gain: 0.18, decaySeconds: 2.2 }, // nominal
  { ratio: 2.66, gain: 0.09, decaySeconds: 1.3 },
  { ratio: 3.35, gain: 0.05, decaySeconds: 0.8 }, // strike transient shimmer
]

/** A second, softer strike gives the two-tone feel of a bowl struck by hand. */
const STRIKES: { delaySeconds: number; velocity: number }[] = [
  { delaySeconds: 0, velocity: 1 },
  { delaySeconds: 0.85, velocity: 0.5 },
]

type AudioContextConstructor = new () => AudioContext

interface ScheduledChime {
  oscillators: OscillatorNode[]
  master: GainNode
}

export interface ChimePlayer {
  /**
   * Creates and resumes the AudioContext. Must be called from inside a user-gesture
   * handler — mobile Safari and Chrome leave the context suspended otherwise, and
   * everything scheduled against it stays silent.
   */
  unlock(): void
  /** Schedules the chime to sound `secondsFromNow` from this moment. */
  scheduleIn(secondsFromNow: number): void
  /** Sounds the chime immediately, replacing anything already scheduled. */
  playNow(): void
  /**
   * Whether the scheduled strike time has actually passed on the audio clock.
   *
   * A suspended context freezes `currentTime`, so this stays false when the browser
   * swallowed a scheduled chime instead of sounding it — which is exactly what a
   * caller needs to distinguish on returning to the foreground.
   */
  hasSounded(): boolean
  /** Silences and tears down anything pending. Safe to call when nothing is scheduled. */
  cancel(): void
  /** Releases the AudioContext. The player is unusable afterwards. */
  dispose(): void
}

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  // Neither constructor is declared on TypeScript's `Window` interface: the standard
  // one is a bare global, and the webkit-prefixed fallback is Safari-only.
  const candidate = window as Window & {
    AudioContext?: AudioContextConstructor
    webkitAudioContext?: AudioContextConstructor
  }
  return candidate.AudioContext ?? candidate.webkitAudioContext ?? null
}

/**
 * Builds the oscillator graph for a single strike and starts every node at its
 * scheduled time. Returns the oscillators so they can be stopped early on cancel.
 */
function buildStrike(
  context: AudioContext,
  destination: AudioNode,
  startTime: number,
  fundamentalHz: number,
  velocity: number
): OscillatorNode[] {
  const oscillators: OscillatorNode[] = []

  for (const partial of PARTIALS) {
    // Doubling the prime a few cents apart produces the slow beating shimmer of a
    // real bowl, where two sides of the rim ring at slightly different pitches.
    const detunes = partial.ratio === 1 ? [-3.5, 3.5] : [0]

    for (const detune of detunes) {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(fundamentalHz * partial.ratio, startTime)
      oscillator.detune.setValueAtTime(detune, startTime)

      const envelope = context.createGain()
      const peak = (partial.gain * velocity) / detunes.length
      envelope.gain.setValueAtTime(SILENCE, startTime)
      envelope.gain.exponentialRampToValueAtTime(peak, startTime + ATTACK_SECONDS)
      envelope.gain.exponentialRampToValueAtTime(SILENCE, startTime + partial.decaySeconds)

      oscillator.connect(envelope)
      envelope.connect(destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + partial.decaySeconds + 0.05)
      oscillators.push(oscillator)
    }
  }

  return oscillators
}

export function createChimePlayer(fundamentalHz: number = DEFAULT_FUNDAMENTAL_HZ): ChimePlayer {
  let context: AudioContext | null = null
  let scheduled: ScheduledChime | null = null
  let scheduledStartTime: number | null = null
  let disposed = false

  function ensureContext(): AudioContext | null {
    if (disposed) return null
    if (context) return context

    const AudioContextCtor = getAudioContextConstructor()
    if (!AudioContextCtor) return null

    try {
      context = new AudioContextCtor()
    } catch (error) {
      // No audio available (unsupported browser, blocked by policy). The timer
      // still works visually, so degrade quietly rather than breaking the UI.
      console.error('Completion chime unavailable:', error)
      return null
    }

    return context
  }

  function cancel() {
    scheduledStartTime = null
    if (!scheduled) return

    const { oscillators, master } = scheduled
    scheduled = null

    try {
      // Duck the master gain over a few milliseconds first: stopping oscillators
      // mid-cycle at full amplitude produces an audible click.
      const now = master.context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + 0.02)

      for (const oscillator of oscillators) {
        oscillator.stop(now + 0.03)
      }
    } catch (error) {
      console.error('Failed to cancel completion chime:', error)
    }
  }

  function scheduleIn(secondsFromNow: number) {
    const audioContext = ensureContext()
    if (!audioContext) return

    cancel()

    try {
      const startTime = audioContext.currentTime + Math.max(0, secondsFromNow)

      const master = audioContext.createGain()
      master.gain.setValueAtTime(MASTER_GAIN, startTime)
      // Guarantee silence by the end of the window, however the partials decay.
      master.gain.setValueAtTime(MASTER_GAIN, startTime + CHIME_DURATION_SECONDS - 1)
      master.gain.linearRampToValueAtTime(0, startTime + CHIME_DURATION_SECONDS)

      const lowpass = audioContext.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.setValueAtTime(LOWPASS_HZ, startTime)

      master.connect(lowpass)
      lowpass.connect(audioContext.destination)

      const oscillators = STRIKES.flatMap((strike) =>
        buildStrike(
          audioContext,
          master,
          startTime + strike.delaySeconds,
          fundamentalHz,
          strike.velocity
        )
      )

      scheduled = { oscillators, master }
      scheduledStartTime = startTime
    } catch (error) {
      console.error('Failed to schedule completion chime:', error)
    }
  }

  return {
    unlock() {
      const audioContext = ensureContext()
      if (!audioContext) return
      if (audioContext.state !== 'suspended') return

      audioContext.resume().catch((error: unknown) => {
        console.error('Failed to resume audio context:', error)
      })
    },

    scheduleIn,

    playNow() {
      scheduleIn(0)
    },

    hasSounded() {
      if (!context || scheduledStartTime === null) return false
      return context.currentTime >= scheduledStartTime
    },

    cancel,

    dispose() {
      cancel()
      disposed = true

      const audioContext = context
      context = null
      if (!audioContext) return

      audioContext.close().catch((error: unknown) => {
        console.error('Failed to close audio context:', error)
      })
    },
  }
}
