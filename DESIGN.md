---
name: Vườn thương
description: A pastel botanical gift with a cream personal letter.
colors:
  ink: "#503d45"
  quiet: "#615661"
  paper: "#fffdf3"
  rose: "#a44d70"
  leaf: "#426c51"
  sky-top: "#9edbe8"
  sky-middle: "#bfe4e8"
  sky-low: "#e2ece0"
  sky-bottom: "#f3f0d8"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(25px, 3vw, 36px)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(27px, 3.1vw, 32px)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.025em"
  body:
    fontFamily: "BeVietnam, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  letter-body:
    fontFamily: "BeVietnam, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.95
  label:
    fontFamily: "BeVietnam, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  paper: "2px"
  pill: "30px"
  circle: "50%"
spacing:
  action-gap: "12px"
  paper-inset: "12px"
  paper-content: "28px 30px 22px"
  paragraph-gap: "15px"
components:
  soft-button:
    backgroundColor: "#fffaf1f0"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  soft-button-hover:
    backgroundColor: "#fffdf8"
  letter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    width: "min(424px, calc(100vw - 36px))"
  close-letter:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.circle}"
    size: "44px"
  letter-return:
    backgroundColor: "transparent"
    textColor: "#586052"
    typography: "{typography.label}"
    padding: "7px 2px"
---

# Design System: Vườn thương

## Overview

**Creative North Star: "Vườn thương"**

The fifteen user reference photos and approved four-state brief establish the world: a soft cloudy sky, one layered pink rose, a garden growing from below and a centered cream letter. Preserve that world; the flowers carry the experience and the interface stays quiet.

**Key Characteristics:**
- Pastel atmosphere and dimensional, overlapping petals.
- Literata lettering, restrained cream controls and an inset paper frame.
- One continuous garden with an optional letter overlay.

## Colors

The sky uses the four named stops at 0%, 37%, 70% and 100%. Paper and ink anchor reading; quiet ink supports instructions. Rose supplies focus and hover accents. The declared leaf token is reserved; the actual canvas foliage uses gradients from `#28583b` through `#438857` to `#73a469`, with stems from `#2c6143` to `#71956a`.

Canvas petals use six HSL bases `(338,62%,57%)`, `(347,59%,66%)`, `(18,67%,69%)`, `(94,46%,64%)`, `(194,64%,64%)`, `(319,39%,69%)`. Procedural light rims, progressively darker inner rings and cast shadows make each layered bloom dimensional. These are drawing colors, distinct from the UI rose accent. Falling pink petals use a gradient from `#efb7cb` through `#d783a6` to `#bc668a`; falling leaves reuse the foliage drawing.

## Typography

Self-hosted Literata supplies the italic intro, dedication, salutation and signature; the letter headline uses upright Literata. Self-hosted Be Vietnam Pro is registered as `BeVietnam` and supplies regular body copy and controls. The dedication is 15px/1.6; salutation and signature are 14px/1.65. The letter body uses the smaller, more open reading role above. Both headings use slight negative tracking; the intro balances its lines, while the letter has authored line breaks.

## Layout

A fixed, non-scrolling viewport uses `100svh`, with a sky behind a decorative canvas. The dedication sits upper left, intro at 24% height, and central rose at 52%. Final controls sit centered near the bottom, with safe-area offsets. There are no page sections or navigation bar.

At widths up to 600px, the intro moves to 23%, the rose target to 50% (180 × 195px), the heading becomes 27px, action spacing becomes 10px and pill padding becomes 10px 18px. Paper inset becomes 10px, content padding 24px 22px 18px, headline 28px and body 12px/1.9. The canvas independently switches below 650px to 54 flowers; larger widths use `min(128, round(width/12))`. Four depth layers keep the central flower visible.

The letter is centered with internal scrolling, width constrained by the viewport and maximum height `min(810px, 100svh - 44px)`; mobile uses `100svh - 32px`. At heights up to 650px the intro moves to 17%, paper top padding shrinks, the headline becomes 25px and the flower ornament becomes 38px high. Controls retain at least 44px targets. The close control stays sticky while reading.

## Elevation & Depth

Depth comes from blurred clouds, ordered flower layers and petal folds. Paper uses `0 20px 70px #425d5430`; cream pills use `0 5px 18px #39544716`. The dialog backdrop uses a translucent `#cee2d825` wash with 5px blur. A fine `#d6d5c35e` inset border gives the paper a physical edge.

## Shapes

Paper is nearly square-cornered, controls are soft pills, and the rose hit target and close button are circular. Flowers use thirteen rings of curved overlapping petals, organic curved stems and alternating leaves. Cloud forms are blurred ellipses rather than hard illustrations.

## Components

**Garden choreography:** four visual states are ready, growing, garden and letter. The implementation stores the first three in `body[data-state]`; letter is a native dialog over the garden. Ready shows one rose. Touch or keyboard activation hides its target and dissolves the intro over 1s. Growth is staggered by 0.45–5.05s, each flower taking 2–3.7s with cubic ease-out stem rise and petal opening. At 8.1s the full garden resolves, final controls appear and the letter opens. The dialog enters over 0.7s with `cubic-bezier(.16,1,.3,1)`, rising 20px and scaling from .97. Closing preserves the garden; replay cancels prior timers and restarts growth using existing sprites.

**Falling leaves and petals:** four sparse shapes drift in the ready state, increasing to 13 below 650px and 23 at larger widths during growth and in the full garden. Sizes are 3–7.3px, fall speeds 10–25px/s, with slow lateral sway, rotation and compressed-width flutter. Their translucent treatment (0.35–0.62 alpha) keeps the garden and letter dominant.

**Motion preferences:** slow independent sway and falling shapes are capped near 30fps; painting pauses while the document is hidden. Reduced motion disables CSS transitions/animations, canvas sway and all falling leaves/petals, resolves growth after 80ms, and focuses “Đọc lại thiệp” for explicit opening. Enabling reduced motion during growth also resolves to the garden without opening the letter.

**Controls:** cream pills rise 2px on hover and return on press, using 0.2s transitions. All buttons have a 2px rose focus outline with 5px offset (8px on the rose). The underlined garden-return action and circular close button close the dialog. Escape and backdrop click also close it, restoring focus to “Đọc lại thiệp”; the native modal contains keyboard focus.

**Letter:** a small floral line illustration precedes “Gửi Tiên iu dấu,” and “Mong những điều đẹp đẽ luôn nở bên cậu.” The body uses tớ/cậu and “tình yêu của tớ”; the signature reads “Gửi em thật nhiều thương mến”. First-screen copy remains the approved generic dedication. Optional `to`/`from` URL text overrides only their existing named fields.

## Do's and Don'ts

### Do:
- Do preserve the reference-led pastel sky, dimensional petals and cream paper.
- Do keep the central rose identifiable within the layered garden.
- Do preserve internal letter scrolling, visible close control and reduced-motion behavior.

### Don't:
- Don't add dashboard framing, navigation sections or oversized controls.
- Don't replace flowers with flat spiral symbols, screenshot backgrounds or confetti bursts; falling decoration stays sparse and botanical.
- Don't reproduce the reference video's POV caption, browser chrome, monitor or keyboard.
