import type { CSSProperties, ReactNode } from 'react'

/* ============================================================================
   THE FINAL FINTECH PAGE — 03 · THE JOURNEYS' ILLUSTRATIONS (Krish, 6 Nov:
   "on the right side nice illustrations kind of thing")

   One small product scene per journey, drawn in HTML and SVG: frosted glass
   cards over soft light in the journey's pastel, the page's blue for what is
   moving. Each plays in when its journey opens (its pieces come up in turn,
   ticks fill, lines draw), then keeps a slow float.

     neo        a balance with its sparkline, the accounts, cards and
                payments it joins, a bank card behind, the partner bank synced
     kyc        an ID being scanned, the onboarding steps ticking through to
                an active account
     payments   money travelling from the customer to the bank, the transfer
                stepping from sent to settled, reconciled
     lending    an application gathering its evidence, a policy check
                filling, approved
     insurance  a claim's timeline with the review in hand, the policyholder,
                broker and claims team on it, the status shared
     fraud      a run of transactions with one flagged, its risk score, the
                case escalated to a reviewer

   The scene is drawn on a 36 × 28 em stage that scales to fit its box
   (container units), so it keeps its composition at any size. The words in
   it are part of the picture (aria-hidden), not page copy.
   ========================================================================== */

export type JourneyId = 'neo' | 'kyc' | 'payments' | 'lending' | 'insurance' | 'fraud'

/** when a piece comes in, in ms after its journey opens */
const at = (ms: number) => ({ '--d': ms }) as CSSProperties

function Check() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M4.2 8.4l2.5 2.4 5.1-5.3" />
    </svg>
  )
}

function Person() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="9" r="4" />
      <path d="M4.5 21c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2" />
    </svg>
  )
}

function Bank() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3.5 9.5 12 4.5l8.5 5M5.5 10v7.5M10 10v7.5M14 10v7.5M18.5 10v7.5M3.5 20h17" />
    </svg>
  )
}

/** a ring that fills and takes a check when its moment comes */
function Tick({ ms }: { ms: number }) {
  return (
    <span className="ji-tick">
      <span data-pop style={at(ms)}>
        <Check />
      </span>
    </span>
  )
}

/** a white pill floating over the scene with a check: the outcome */
function Chip({ className, ms, tone, children }: { className: string; ms: number; tone: string; children: ReactNode }) {
  return (
    <span className={`ji-chip ${className}`} data-pop style={at(ms)} data-umm-tone={tone}>
      <span className="ji-chip__tick">
        <Check />
      </span>
      {children}
    </span>
  )
}

/** a grey bar standing for a line of text */
const Sk = ({ w }: { w: number }) => <i className="ji-sk" style={{ width: `${w}em` }} />

/* --- the six scenes ------------------------------------------------------------------ */

function Neo() {
  const tiles = [
    ['sky', 'Accounts'],
    ['sun', 'Cards'],
    ['blossom', 'Payments'],
  ]
  return (
    <>
      <div className="ji-bankcard" data-pop style={at(0)}>
        <span className="ji-bankcard__chip" />
        <span className="ji-bankcard__no">•••• 4821</span>
        <span className="ji-bankcard__mark">
          <i />
          <i />
        </span>
      </div>
      <div className="ji-card ji-neo__app" data-pop style={at(140)}>
        <div className="ji-row">
          <span className="ji-ava" data-umm-tone="sky">
            <Person />
          </span>
          <Sk w={5.5} />
        </div>
        <p className="ji-k">Total balance</p>
        <p className="ji-big">
          £12,480<small>.20</small>
        </p>
        <svg className="ji-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ji-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1658f2" stopOpacity="0.2" />
              <stop offset="1" stopColor="#1658f2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="ji-spark__area" d="M0 25 C10 23 14 17 24 18 S38 23 48 16 S64 8 74 11 S90 5 100 3 V30 H0Z" />
          <path className="ji-spark__line" pathLength={1} d="M0 25 C10 23 14 17 24 18 S38 23 48 16 S64 8 74 11 S90 5 100 3" />
        </svg>
        <div className="ji-tiles">
          {tiles.map(([tone, label], k) => (
            <span key={label} className="ji-tile" data-umm-tone={tone} data-pop style={at(520 + k * 120)}>
              <i />
              {label}
            </span>
          ))}
        </div>
      </div>
      <Chip className="ji-neo__sync" ms={1250} tone="sky">
        Partner bank synced
      </Chip>
    </>
  )
}

function Kyc() {
  const steps = ['Identity', 'Documents', 'Review', 'Account']
  return (
    <>
      <div className="ji-card ji-kyc__id" data-pop style={at(0)}>
        <span className="ji-kyc__photo" data-umm-tone="citrus">
          <Person />
        </span>
        <span className="ji-kyc__lines">
          <Sk w={7.5} />
          <Sk w={5.5} />
          <Sk w={8.5} />
          <Sk w={4} />
        </span>
        <span className="ji-kyc__scan" />
      </div>
      <div className="ji-card ji-kyc__doc" data-pop style={at(380)}>
        <span className="ji-doc" data-umm-tone="sky">
          <i />
          <i />
          <i />
        </span>
        <span className="ji-kyc__doclines">
          <Sk w={6.5} />
          <Sk w={4.5} />
        </span>
        <Tick ms={1100} />
      </div>
      <div className="ji-card ji-kyc__steps" data-pop style={at(200)}>
        <p className="ji-k">Onboarding</p>
        <ol>
          {steps.map((s, k) => (
            <li key={s}>
              <Tick ms={650 + k * 420} />
              {s}
            </li>
          ))}
        </ol>
      </div>
      <Chip className="ji-kyc__done" ms={2450} tone="citrus">
        Account active
      </Chip>
    </>
  )
}

function Payments() {
  const steps = ['Sent', 'In transit', 'Settled']
  return (
    <>
      <svg className="ji-pay__route" viewBox="0 0 360 280">
        <path d="M78 92 C 128 18, 232 18, 282 92" />
        <circle r="6.5" className="ji-pay__coin">
          <animateMotion
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keyPoints="0;1"
            keyTimes="0;1"
            keySplines="0.5 0 0.3 1"
            path="M78 92 C 128 18, 232 18, 282 92"
          />
        </circle>
      </svg>
      <span className="ji-node ji-pay__from" data-umm-tone="sky" data-pop style={at(0)}>
        <Person />
      </span>
      <span className="ji-node ji-pay__to" data-umm-tone="sun" data-pop style={at(120)}>
        <Bank />
      </span>
      <div className="ji-card ji-pay__card" data-pop style={at(240)}>
        <div className="ji-row ji-row--between">
          <p className="ji-k">Transfer to Maria L.</p>
          <p className="ji-k">Today</p>
        </div>
        <p className="ji-big">
          £2,400<small>.00</small>
        </p>
        <div className="ji-steps3">
          <span className="ji-steps3__track">
            <i />
          </span>
          {steps.map((s, k) => (
            <span key={s} className="ji-steps3__s" style={at(500 + k * 700)}>
              <b />
              {s}
            </span>
          ))}
        </div>
      </div>
      <Chip className="ji-pay__rec" ms={2200} tone="sun">
        Reconciled
      </Chip>
    </>
  )
}

function Lending() {
  const docs = [
    ['blossom', 'Payslips'],
    ['sky', 'Bank statements'],
    ['lilac', 'ID document'],
  ]
  return (
    <>
      <div className="ji-card ji-lend__app" data-pop style={at(0)}>
        <p className="ji-k">Loan application</p>
        <p className="ji-big">£45,000</p>
        <p className="ji-k ji-k--cap">Evidence</p>
        <ul className="ji-docs">
          {docs.map(([tone, label], k) => (
            <li key={label} data-pop style={at(420 + k * 280)}>
              <span className="ji-doc" data-umm-tone={tone}>
                <i />
                <i />
                <i />
              </span>
              {label}
              <Tick ms={700 + k * 280} />
            </li>
          ))}
        </ul>
      </div>
      <div className="ji-card ji-lend__gauge" data-pop style={at(240)}>
        <svg viewBox="0 0 120 68">
          <path className="ji-gauge__track" d="M12 60 A48 48 0 0 1 108 60" />
          <path className="ji-gauge__fill" pathLength={1} d="M12 60 A48 48 0 0 1 108 60" />
        </svg>
        <p className="ji-k">Policy check</p>
        <p className="ji-mid">Low risk</p>
      </div>
      <Chip className="ji-lend__ok" ms={2250} tone="blossom">
        Approved
      </Chip>
    </>
  )
}

function Insurance() {
  const steps = [
    ['Notified', 'done'],
    ['Documents', 'done'],
    ['Handler review', 'now'],
    ['Settled', 'next'],
  ]
  const people = [
    ['coral', 'Policyholder'],
    ['sky', 'Broker'],
    ['lilac', 'Claims team'],
  ]
  return (
    <>
      <div className="ji-card ji-ins__claim" data-pop style={at(0)}>
        <div className="ji-row ji-row--between">
          <p className="ji-k">Claim #4821</p>
          <span className="ji-tag" data-umm-tone="coral">
            Water damage
          </span>
        </div>
        <ol className="ji-time">
          {steps.map(([s, state], k) => (
            <li key={s} data-state={state} data-pop style={at(380 + k * 260)}>
              <b>{state === 'done' && <Check />}</b>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <div className="ji-card ji-ins__people" data-pop style={at(240)}>
        {people.map(([tone, label], k) => (
          <span key={label} className="ji-person" data-pop style={at(560 + k * 200)}>
            <span className="ji-ava" data-umm-tone={tone}>
              <Person />
            </span>
            {label}
          </span>
        ))}
      </div>
      <Chip className="ji-ins__share" ms={2000} tone="coral">
        Status shared
      </Chip>
    </>
  )
}

function Fraud() {
  const rows = [
    ['sky', '£24.90'],
    ['sun', '£120.00'],
    ['coral', '£9,800.00'],
    ['lilac', '£56.10'],
    ['citrus', '£14.25'],
  ]
  return (
    <>
      <div className="ji-card ji-fr__list" data-pop style={at(0)}>
        <p className="ji-k">Transactions</p>
        <ul>
          {rows.map(([tone, amount], k) => (
            <li key={amount} data-flag={k === 2 || undefined} data-pop style={at(180 + k * 110)}>
              <span className="ji-merch" data-umm-tone={tone} />
              {k === 2 ? <span className="ji-flag">Unusual</span> : <Sk w={[6.5, 5, 0, 7, 5.5][k]} />}
              <span className="ji-amt">{amount}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="ji-card ji-fr__risk" data-pop style={at(300)}>
        <span className="ji-ring">
          <svg viewBox="0 0 64 64">
            <circle className="ji-ring__track" cx="32" cy="32" r="26" />
            <circle className="ji-ring__fill" cx="32" cy="32" r="26" pathLength={1} />
          </svg>
          <b>82</b>
        </span>
        <p className="ji-k">Risk score</p>
      </div>
      <Chip className="ji-fr__esc" ms={2100} tone="coral">
        Escalated to reviewer
      </Chip>
    </>
  )
}

const SCENE: Record<JourneyId, () => JSX.Element> = {
  neo: Neo,
  kyc: Kyc,
  payments: Payments,
  lending: Lending,
  insurance: Insurance,
  fraud: Fraud,
}

export function JourneyArt({ id, tone }: { id: JourneyId; tone: string }) {
  const Scene = SCENE[id]
  return (
    <div className={`ji ji--${id}`} data-umm-tone={tone} aria-hidden="true">
      <div className="ji__stage">
        <Scene />
      </div>
    </div>
  )
}
