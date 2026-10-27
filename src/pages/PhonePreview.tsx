import { useEffect, useState } from 'react'

/* ============================================================================
   PHONE PREVIEW — /phone

   The homepage hero as a phone shows it, three times side by side (ASCII,
   print, particles), for reviewing on a desktop. Each frame is the live
   page in an iframe at 390 × 844, an iPhone 14 or 15, scaled down to fit
   the window's height.
   ========================================================================== */

const PHONES = [
  { v: 'ascii', label: 'ASCII' },
  { v: 'print', label: 'Print' },
  { v: 'particles', label: 'Particles' },
]

const W = 390
const H = 844

/** The scale that fits a phone, its bezel and its caption in the window. */
const fit = () => Math.min(1, (window.innerHeight - 190) / (H + 24), (window.innerWidth - 80) / 3 / (W + 24))

export function PhonePreview() {
  const [s, setS] = useState(fit)
  useEffect(() => {
    const on = () => setS(fit())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  return (
    <main className="pp">
      <header className="pp__head">
        <h1>The homepage hero on a phone</h1>
        <p>
          Each frame is the live page at {W} × {H}, the size of an iPhone 14 or 15. Move the cursor or drag inside a
          frame to try the effects; Options opens each one’s settings.
        </p>
      </header>
      <div className="pp__row">
        {PHONES.map((p) => (
          <figure key={p.v} className="pp__phone">
            <div className="pp__bezel" style={{ width: W * s + 24, height: H * s + 24 }}>
              <div className="pp__screen" style={{ width: W * s, height: H * s }}>
                <iframe
                  src={`/home?v=${p.v}`}
                  title={`Homepage hero, ${p.label}, on a phone`}
                  width={W}
                  height={H}
                  style={{ transform: `scale(${s})` }}
                />
              </div>
            </div>
            <figcaption>{p.label}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  )
}
