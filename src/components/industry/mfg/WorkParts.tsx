import { useId } from 'react'
import { SplitButton } from '@/components/primitives'
import { work } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · relevant work, the pieces its options share
   (MfgWorkSwatch, MfgWorkLoop, MfgWorkCarpet; Krish, 16 Nov: "keep simple
   options in there, I will review it")

   CaseCard   one engagement as the section has always shown it: its drawing
              on its pastel, its words, UMM's role, one action
   Weave      a carpet's construction drawn in fine line, Mohawk being a
              flooring maker: loop pile, twill or basket, one per engagement
   ========================================================================== */

export type WorkCase = (typeof work.cases)[number]

export function CaseCard({ x, k }: { x: WorkCase; k: number }) {
  return (
    <article className="mw-case wo-case" data-tone={x.tone}>
      <div className="mw-case__art">
        <span className="ff-glass mw-case__tag">{x.tag}</span>
        <MfgArt name={x.art} />
      </div>
      <div className="mw-case__text">
        <p className="mw-case__k">
          <span>{pad(k)}</span>
          {x.eyebrow}
        </p>
        <h3>{x.name}</h3>
        <p className="mw-case__title">{x.title}</p>
        <p className="mw-case__body">{x.body}</p>
        <div className="mw-case__role">
          <p>{work.roleLabel}</p>
          <ul>
            {x.role.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <SplitButton className="mw-case__go" href={x.href} target="_blank" rel="noopener">
          {work.read}
        </SplitButton>
      </div>
    </article>
  )
}

/** a carpet's construction, tiled over whatever holds it */
export function Weave({ kind, className = '' }: { kind: string; className?: string }) {
  const id = 'wv' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg className={`wv ${className}`} aria-hidden="true">
      <defs>
        {kind === 'loop' && (
          <pattern id={id} width="18" height="14" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4" r="2.6" />
            <circle cx="13.5" cy="11" r="2.6" />
          </pattern>
        )}
        {kind === 'twill' && (
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M-2 12L12 -2M-7 7L7 -7M3 17L17 3" />
          </pattern>
        )}
        {kind === 'basket' && (
          <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M2 3.5h8M2 6h8M2 8.5h8M15.5 2v8M18 2v8M20.5 2v8M3.5 14v8M6 14v8M8.5 14v8M14 15.5h8M14 18h8M14 20.5h8" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
