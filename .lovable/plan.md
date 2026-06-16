## Plan: Restore Warm Sand Theme

### Problem
The app currently shows the blue Ocean Deep theme. The previously-selected Warm Sand (warm beige/brown) theme was lost.

### Solution
Replace the color tokens in `src/index.css` with the Warm Sand palette:

**Light mode (`:root`)**
- Background: `#faf8f5`
- Card: `#f0ebe3`
- Primary: `#8b7355`
- Accent: `#c9b99a`
- Text: dark warm brown

**Dark mode (`.dark`)**
- Background: `#221e19`
- Card: `#332c25`
- Primary: `#c9b99a`
- Text: warm cream

**Gradients/shadows**
- Update from blue (`gradient-gold`, `shadow-gold`) to warm brown/beige variants (`gradient-warm`, `shadow-warm`).

### Files to change
- `src/index.css` — color variable definitions

### Out of scope
- No component logic changes
- No new features