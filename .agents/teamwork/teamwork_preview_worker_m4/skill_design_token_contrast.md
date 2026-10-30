# Skill: Design Token Contrast (Local Snapshot)
Referenced from `.agents/skills/design-token-contrast/SKILL.md`.

## Key WCAG 2.2 AA Minimums:
- Normal text: 4.5:1 (1.4.3)
- Large text: 3:1
- UI components and graphics: 3:1 (1.4.11)

## FutStats Tokens:
- Light theme background: Areia `#F1E8DE`
- Dark theme background: Carvão `#1B1A17`
- Neon green `#22c55e` on `#F1E8DE` is only 1.88:1 (FAIL).
- Token `--positive`:
  - Light mode: `#526337` (contrast on `#F1E8DE` is ~5.1:1 -> PASS WCAG AA)
  - Dark mode: `#B7C59C` (contrast on `#1B1A17` is ~8.5:1 -> PASS WCAG AA)
- Token `--positive-bg`:
  - Light mode: `rgba(90, 103, 62, 0.12)`
  - Dark mode: `rgba(183, 197, 156, 0.15)`
