/* ============================================================================
   HOME — hero content, shared by the three hero versions

   The homepage does not answer anything itself. Every question, picked or
   typed, is handed to RAGe, UMM's own question-and-answer model, which reads
   it from ?query= and submits it on arrival.
   ========================================================================== */

export const homeNav = {
  links: [
    { label: 'UMM AI', href: 'https://umm.digital/rage/', spark: true },
    { label: 'Expertise', href: '#' },
    { label: 'Re>Think', href: '#' },
    { label: 'Industries', href: '#' },
    { label: 'Resources', href: '#' },
    { label: 'About', href: '#' },
  ],
  cta: { label: 'Get in touch', href: 'https://umm.digital/contact-us/' },
}

export const homeHero = {
  title: ['AI-first engineering,', 'built to deliver.'],
  placeholder: 'What can we help you achieve?',
  pillars: ['Strategy', 'Experience', 'Product', 'AI First'],
}

export const rage = {
  name: 'RAGe',
  tagline: 'Get to know UMM’s world instantly. Just ask!',
  url: (q: string) => `https://umm.digital/rage/?query=${encodeURIComponent(q)}`,
}

/** The six chips exactly as the live hero words them, each with the scene
 *  it calls up on hover. */
export const asciiChips = [
  { q: 'Architect data-rich solutions for tomorrow’s leaders', scene: 'city' },
  { q: 'Accelerate your digital transformation', scene: 'tunnel' },
  { q: 'Drive innovation through AI-powered solutions', scene: 'eye' },
  { q: 'Build scalable solutions for the future', scene: 'knot' },
  { q: 'See how UMM delivers impact', scene: 'logo' },
  { q: 'Scale smarter with UMM’s AI-powered solutions', scene: 'mountains' },
] as const

/** The live site's reel, the fallback for the hero's bottom-right card until
 *  the eye film is added at public/home/eye.mp4. */
export const eyeFilm = 'https://umm.digital/wp-content/uploads/2026/08/home-f-1.webm'
