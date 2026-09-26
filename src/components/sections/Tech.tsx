import { Note, SectionHead, toneVar } from '../primitives'
import { marks } from '../marks'
import { useCardSwap } from '@/lib/useCardSwap'
import { tech, techStack } from '@/content/experienceDesign'

/* ============================================================================
   TECHNOLOGY

   Left carries the argument, right carries the evidence.

   The deck deals itself: the front card drops out, travels back and rejoins at
   the rear while the rest promote. The left column is wired to the same clock —
   the role verb, the claim and the lit row in the index all belong to whichever
   card is up. Click a row in the index and the deck flies to that card, so the
   list is a control as well as a readout. Exactly one thing decides what is
   showing.

   Names are set as monograms, not vendor logos. The note underneath says these
   groupings imply no partnership or certification, and a wall of real marks
   would argue the opposite.
   ========================================================================== */

const { groups, categories } = techStack
const PLATFORMS = groups.reduce((n, g) => n + g.items.length, 0)

export function Tech() {
  const { order, front, slot, goTo, hold, still } = useCardSwap(groups.length)

  const live = groups[front]
  const role = categories.find((c) => c.id === live.category)

  return (
    <section className="umm-section umm-section--railed umm-tech" id="tech">
      <div className="umm-container umm-tech__inner">
        {/* ---------------------------------------------------------------
            The argument
            --------------------------------------------------------------- */}
        <div className="umm-tech__say">
          <SectionHead
            chapter={tech.chapter}
            title={
              <>
                {tech.titleLead} {tech.titleAccent}
              </>
            }
            lead={tech.lead}
          />

          {/* Changes with the deck. Held to a fixed height so the index below
              never shifts as the claim runs one line shorter. */}
          <div
            className="umm-tech__live"
            style={{ ['--tone' as string]: toneVar(live.tone) }}
            aria-live="polite"
          >
            <div className="umm-tech__role">
              <span className="umm-tech__dot" aria-hidden="true" />
              <span className="umm-tech__verb">{role?.role}</span>
              <span className="umm-tech__count">
                {String(front + 1).padStart(2, '0')}
                <i>/</i>
                {String(groups.length).padStart(2, '0')}
              </span>
            </div>
            <p className="umm-tech__claim" key={live.id}>
              {live.claim}
            </p>
          </div>

          {/* The three ways we work, with the groups that sit under each. Lit
              row is the card that is up; clicking one deals the deck to it. */}
          <div className="umm-tech__index">
            {categories.map((cat) => {
              const mine = groups.filter((g) => g.category === cat.id)
              const on = live.category === cat.id
              return (
                <div className="umm-tech__cat" data-on={on} key={cat.id}>
                  <span className="umm-tech__cat-label">{cat.label}</span>
                  <ul className="umm-tech__rows">
                    {mine.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          className="umm-tech__row"
                          data-on={g.id === live.id}
                          style={{ ['--tone' as string]: toneVar(g.tone) }}
                          aria-current={g.id === live.id}
                          onClick={() => goTo(groups.indexOf(g))}
                        >
                          <span className="umm-tech__row-line" aria-hidden="true" />
                          {g.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <p className="umm-tech__tally">
            <strong>{PLATFORMS}</strong> platforms
            <i aria-hidden="true">·</i>
            <strong>{groups.length}</strong> groups
            <i aria-hidden="true">·</i>
            <strong>{categories.length}</strong> ways we work with them
          </p>
        </div>

        {/* ---------------------------------------------------------------
            The evidence
            --------------------------------------------------------------- */}
        <div
          className="umm-tech__deck"
          data-still={still}
          onMouseEnter={() => hold(true)}
          onMouseLeave={() => hold(false)}
        >
          <div className="umm-tech__stack">
            {groups.map((group, i) => {
              const s = slot(i)
              const depth = order.indexOf(i)
              return (
                <article
                  className="umm-tcard"
                  key={group.id}
                  aria-hidden={depth !== 0}
                  style={{
                    ['--tone' as string]: toneVar(group.tone),
                    ['--ink' as string]: s.ink,
                    transform: s.transform,
                    opacity: s.opacity,
                    zIndex: s.z,
                  }}
                >
                  {/* Fills the air a two-tool card would otherwise leave, and
                      is simply covered up on a seven-tool one. */}
                  <span className="umm-tcard__ghost" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <h3 className="umm-tcard__label">{group.label}</h3>

                  <ul className="umm-tcard__items">
                    {group.items.map((item) => (
                      <li className="umm-tcard__item" key={item.name}>
                        <img
                          className="umm-tcard__mark"
                          src={marks[item.name]}
                          alt=""
                          aria-hidden="true"
                          width={22}
                          height={22}
                        />
                        <span className="umm-tcard__name">{item.name}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="umm-tcard__foot">
                    <span>
                      {categories.find((c) => c.id === group.category)?.role}
                    </span>
                    <span className="umm-tcard__tools">
                      {group.items.length} tools
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <div className="umm-container umm-tech__note">
        <Note bare>{tech.note}</Note>
      </div>
    </section>
  )
}
