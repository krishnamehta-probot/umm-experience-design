import type { ReactNode } from 'react'
import type { Head as HeadContent } from '@/content/manufacturing'

/* every section's head on the industry pages: the eyebrow pill and the
   heading on the left (its second line in the blue), the intro on the right,
   the lines rising in as the section arrives */
export function Head({ id, head, dark = false, children }: { id: string; head: HeadContent; dark?: boolean; children?: ReactNode }) {
  return (
    <div className={`mf-top${dark ? ' mf-top--dark' : ''}`} data-umm-reveal>
      <div className="mf-head">
        <p className={dark ? 'ff-glass ff-glass--dark' : 'ff-eyebrow'}>{head.eyebrow}</p>
        <h2 id={id} className="mf-title">
          <span className="mf-line">
            <span>{head.lines[0]}</span>
          </span>
          <span className="mf-line mf-line--2">
            <span className={dark ? 'mf-glow' : 'ff-blue'}>{head.lines[1]}</span>
          </span>
        </h2>
      </div>
      <div className="mf-side">
        <p className="mf-lead">{head.intro}</p>
        {children}
      </div>
    </div>
  )
}
