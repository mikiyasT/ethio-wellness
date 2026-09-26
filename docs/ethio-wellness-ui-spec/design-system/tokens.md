# Design Tokens

Visualized in `colors.png` (swatches) and `typography.png` (scale specimens).

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| `--primary` | `#1C5C3A` | Deep green — primary buttons, active states, links |
| `--primary-hover` | `#154A2E` | Primary hover |
| `--primary-dark` | `#0E3A23` | Footer, dark sections |
| `--primary-tint` | `#EAF3ED` | Light green backgrounds, selected chips |
| `--gold` | `#C08A2D` | Amber — accents, stars, secondary CTAs |
| `--gold-hover` | `#A67424` | Gold hover |
| `--gold-tint` | `#FAF1DE` | Light amber backgrounds |
| `--clay` | `#B4552D` | Sparingly — warnings, destructive accents |
| `--bg` | `#FAF6EE` | Page background (warm paper) |
| `--surface` | `#FFFFFF` | Cards, modals, inputs |
| `--surface-warm` | `#F4EEE0` | Alt section backgrounds |
| `--border` | `#E7DCC6` | Default borders, dividers |
| `--border-strong` | `#D6C8A8` | Emphasized borders |
| `--text` | `#221A11` | Headings, body |
| `--text-2` | `#5D5347` | Secondary text |
| `--text-3` | `#8C8071` | Tertiary / placeholder |
| `--success` | `#1C5C3A` | Success states (= primary green) |
| `--warning` | `#9A6B1A` | Warning alerts |
| `--error` | `#B3261E` | Errors, destructive |
| `--info` | `#2456A6` | Informational alerts |

## Typography

- **Families:** Inter (Latin) · "Noto Sans Ethiopic" (Ethiopic, via `.eth` class)
- **Scale:**

| Style | Size | Weight | Line-height |
|-------|------|--------|-------------|
| Display / Hero H1 | 44px (32 mobile) | 700 | 1.15 |
| H2 | 32px (26 mobile) | 700 | 1.2 |
| H3 | 24px (20 mobile) | 600 | 1.25 |
| H4 / card title | 18px | 600 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Body small | 14px | 400 | 1.5 |
| Caption / meta | 13px | 400 | 1.45 |
| Button | 16px (14 sm) | 600 | 1.2 |

- Ethiopic headings may need a touch more line-height (×1.25) — allow it.

## Spacing

- Base 8pt grid; 4pt for tight internal padding (chips, slot chips, meta rows).
- Section padding: 64px desktop / 32px mobile. Card padding: 24px. Gaps: 16–24px between cards.

## Radius

| Element | Radius |
|---------|--------|
| Button | 10px |
| Card | 16px |
| Chip | pill |
| Input | 10px |
| Modal | 16px |
| Avatar | 50% (circle) |

## Notes

- `colors.png` and `typography.png` visualize these tokens — keep them in sync if tokens change.
- Focus rings use `--primary` at 3px outline offset 2px (see `components.md`).
