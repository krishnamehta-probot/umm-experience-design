import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import type { Tone } from '@/components/primitives'

/* ============================================================================
   AI page section heading — the locked CX heading, exactly

   The same markup the CX sections use (cx-head, ChipHead, cx-lead), for the
   two sections the AI page adds (AI in practice, the invoice workflow), so
   they read as part of the same design.
   ========================================================================== */

export function AiHead({
  chip,
  line1,
  line2,
  accent,
  lead,
  tone,
  lineRecipe = 2,
  id,
}: {
  chip: string
  line1: string
  line2: string
  accent: string
  lead?: string
  tone: Tone
  lineRecipe?: number
  id?: string
}) {
  return (
    <div className="cx-head cx-head--tight">
      <ChipHead
        id={id}
        line1={line1}
        line2={withAccent(line2, accent)}
        chip={chip}
        tone={tone}
        lineRecipe={lineRecipe}
      />
      {lead ? <p className="cx-lead">{lead}</p> : null}
    </div>
  )
}
