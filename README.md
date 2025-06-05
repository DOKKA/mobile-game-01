# 🍭 Sweet Swipe

A lightweight, fully-client-side HTML 5 match-3 game (think simplified **Candy Crush**) tuned for iOS 17+ Safari and playable offline thanks to a Service Worker.

| Feature | Details |
|---------|---------|
| Grid    | 8 × 8 CSS Grid, emoji candies |
| Input   | Touch, mouse, and keyboard (arrow keys + Space) |
| Rules   | Swap adjacent candies, clear runs ≥ 3, chain reactions, 20-move limit |
| Scoring | +10 pts / candy removed |
| UX      | 60 fps CSS transitions, no double-tap zoom |
| PWA     | `manifest.webmanifest` + offline cache (`sw.js`) |
| License | MIT |

**Controls**

* **Swipe / drag**: swap the touched candy with the neighbour in swipe direction  
* **Mouse**: click-drag in the direction you want to swap  
* **Keyboard**: use **← ↑ ↓ →** to move a cursor, **Space** swaps with the next key-press direction  

Play it here once GitHub Pages finishes building:  
`https://<your-username>.github.io/sweet-swipe`

---

## Local development

No build step required—just open `index.html`.  
A tiny dev server with live reload is handy:

```bash
npx serve .
