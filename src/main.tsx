import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/journey.css'
import './styles/nav.css'
import './styles/hero.css'
import './styles/sections.css'
import './styles/styleguide.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
