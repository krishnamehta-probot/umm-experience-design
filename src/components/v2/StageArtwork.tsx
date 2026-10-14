const THREADS = [
  [
    'M 82 253 C 124 182 151 74 251 69 C 337 63 356 205 433 209 C 497 213 514 125 562 84',
    'M 115 49 C 158 116 244 271 326 260 C 404 250 394 93 475 87 C 521 84 545 123 568 158',
    'M 69 143 C 164 81 231 91 283 155 C 343 228 398 247 451 194 C 490 155 515 155 578 213',
    'M 134 282 C 184 232 223 191 272 185 C 344 176 363 294 435 295 C 485 296 511 259 551 229',
  ],
  [
    'M 53 258 C 116 206 118 79 216 83 C 291 86 307 221 376 219 C 450 217 436 68 527 76 C 555 78 575 102 593 126',
    'M 85 72 C 160 120 172 266 253 273 C 338 281 346 113 421 111 C 489 109 503 230 570 259',
    'M 51 178 C 122 114 190 107 248 157 C 314 213 355 282 414 256 C 469 232 487 151 590 168',
    'M 80 300 C 140 263 189 202 235 198 C 296 193 327 305 390 306 C 461 307 487 219 552 202',
    'M 156 34 C 198 92 244 130 295 131 C 361 132 390 44 449 49 C 508 54 526 117 573 139',
    'M 48 116 C 130 158 151 212 203 224 C 276 241 304 157 366 154 C 440 151 461 297 531 291',
    'M 109 222 C 155 181 198 153 245 161 C 306 170 329 239 380 239 C 438 239 480 90 542 102',
  ],
  [
    'M 28 275 C 89 234 72 91 159 91 C 237 91 225 274 308 274 C 394 274 384 71 471 71 C 523 71 548 109 605 137',
    'M 46 88 C 111 130 106 282 191 282 C 275 282 276 97 359 97 C 443 97 450 286 536 286 C 568 286 586 265 612 242',
    'M 24 174 C 95 114 144 117 201 168 C 258 220 296 274 354 237 C 415 198 437 109 499 122 C 546 131 569 185 612 205',
    'M 52 326 C 120 270 154 211 215 211 C 284 211 317 328 380 326 C 451 324 477 205 537 194 C 565 189 587 202 611 221',
    'M 113 35 C 150 89 204 130 260 126 C 321 122 345 31 408 33 C 468 35 497 111 561 126',
    'M 18 224 C 86 168 128 163 176 202 C 231 247 258 309 319 299 C 387 288 404 170 461 167 C 518 164 550 231 613 257',
    'M 76 44 C 125 96 135 160 185 171 C 244 184 282 114 337 116 C 399 118 424 203 482 207 C 535 211 571 162 614 154',
    'M 18 132 C 75 168 94 211 143 229 C 199 249 238 204 285 198 C 348 190 379 252 430 266 C 494 284 542 251 611 274',
    'M 69 300 C 133 310 170 276 211 256 C 268 228 300 243 342 276 C 393 316 444 311 488 274 C 529 240 565 232 614 239',
    'M 92 20 C 149 53 165 88 210 101 C 273 120 308 69 357 62 C 418 53 452 91 496 105 C 543 119 573 102 611 79',
  ],
]

const DESCRIPTIONS = [
  'A single bright path finds its way through a loose, open field.',
  'Several flowing paths weave together and settle into a shared rhythm.',
  'A dense network of paths resolves into one connected field.',
]

const PALETTE = [
  ['var(--umm-sun)', 'var(--umm-coral)', 'var(--umm-blossom)'],
  ['var(--umm-blossom)', 'var(--umm-coral)', 'var(--umm-sun)'],
  ['var(--umm-sky)', 'var(--umm-blossom)', 'var(--umm-citrus)'],
]

/** Bespoke ribbon-field artwork. Its form evolves with the selected stage. */
export function StageArtwork({ stageIndex }: { stageIndex: number }) {
  const active = Math.max(0, Math.min(2, stageIndex))

  return (
    <svg
      className="cx-stage-art"
      viewBox="140 0 500 360"
      role="img"
      aria-label={DESCRIPTIONS[active]}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {PALETTE.map((colors, i) => (
          <linearGradient id={`cx-stage-ribbon-${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="0.52" stopColor={colors[1]} />
            <stop offset="1" stopColor={colors[2]} />
          </linearGradient>
        ))}
        <radialGradient id="cx-stage-core">
          <stop offset="0" stopColor="white" stopOpacity="0.92" />
          <stop offset="0.3" stopColor="var(--umm-paper)" stopOpacity="0.78" />
          <stop offset="1" stopColor="var(--umm-paper)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse className="cx-stage-art__wash" cx="395" cy="166" rx="224" ry="154" fill="url(#cx-stage-core)" />
      <g className="cx-stage-art__orbit" fill="none" stroke="var(--umm-ink)" strokeOpacity="0.24">
        <ellipse cx="390" cy="164" rx="188" ry="86" transform="rotate(-23 390 164)" strokeWidth="1" strokeDasharray="2 8" />
        <ellipse cx="390" cy="164" rx="147" ry="117" transform="rotate(34 390 164)" strokeWidth="1" strokeDasharray="1 9" />
      </g>

      {THREADS.map((paths, stage) => (
        <g
          className="cx-stage-art__form"
          data-active={active === stage}
          key={stage}
          aria-hidden="true"
        >
          <g className="cx-stage-art__threads">
            {paths.map((d, i) => (
              <g key={d}>
                <path d={d} fill="none" stroke="var(--umm-ink)" strokeOpacity="0.74" strokeWidth={i % 3 === 0 ? 22 : 15} strokeLinecap="round" />
                <path d={d} fill="none" stroke={`url(#cx-stage-ribbon-${stage})`} strokeWidth={i % 3 === 0 ? 16 : 10} strokeLinecap="round" />
                <path d={d} fill="none" stroke="white" strokeOpacity="0.54" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 12" />
              </g>
            ))}
          </g>
          <g className="cx-stage-art__core" transform="translate(390 164)">
            <ellipse rx="47" ry="26" fill="none" stroke="var(--umm-ink)" strokeOpacity="0.38" strokeWidth="1" transform="rotate(-34)" />
            <ellipse rx="35" ry="44" fill="none" stroke={`url(#cx-stage-ribbon-${stage})`} strokeOpacity="0.84" strokeWidth="2.2" transform="rotate(34)" />
            <path d="M -29 0 C -14 -27 14 -27 29 0 C 14 27 -14 27 -29 0 Z" fill={`url(#cx-stage-ribbon-${stage})`} fillOpacity="0.68" stroke="var(--umm-ink)" strokeOpacity="0.74" strokeWidth="1.2" />
            <path d="M -29 0 C -12 -12 12 -12 29 0 C 12 12 -12 12 -29 0 Z" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" />
            <circle r="3.5" fill="var(--umm-ink)" />
          </g>
        </g>
      ))}

    </svg>
  )
}
