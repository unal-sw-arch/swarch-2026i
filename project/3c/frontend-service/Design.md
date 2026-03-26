# Design System Specification: The Digital Sanctuary

## 1. Overview & Creative North Star
This design system rejects the high-friction, "tactical" aesthetic prevalent in gaming. Instead of sharp angles and aggressive neon, we are building a **"Digital Sanctuary."** Our Creative North Star is focused on high-end editorial comfort—think of a dimly lit, premium library lounge where the lighting is soft, the surfaces are tactile, and every interaction feels like an invitation rather than a command.

We break the "template" look by leaning into **Atmospheric Depth**. This is achieved through generous whitespace (using our Spacing Scale), intentional asymmetry in layout, and a focus on "game cases" that feel like physical objects on a shelf rather than flat digital rectangles.

## 2. Color & Surface Philosophy
The palette moves away from sterile grays into deep, warm espresso (`background: #140c0c`) and soft slates. This provides a rich, low-contrast canvas that reduces eye strain and promotes long-term engagement.

*   **The "No-Line" Rule:** To maintain a premium feel, designers are **prohibited from using 1px solid borders** for sectioning. Boundaries must be defined solely through background shifts. For instance, a main content area using `surface` should be distinguished from a sidebar using `surface-container-low`.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. An inner card (`surface-container-highest`) sits atop a section (`surface-container-low`), which sits on the global `background`. This "nesting" creates natural depth without visual clutter.
*   **The "Glass & Gradient" Rule:** Floating elements (like navigation bars or modals) should utilize Glassmorphism. Use `secondary_container` at 60% opacity with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For primary CTAs and Hero backgrounds, use a subtle linear gradient transitioning from `primary` (#ff9a5d) to `primary_container` (#f9873e). This adds "soul" and a soft glow that flat colors cannot replicate.

## 3. Typography
We utilize a dual-font strategy to balance friendliness with high-end readability.

*   **Headings (Lexend):** Used for `display` and `headline` scales. Lexend’s rounded terminals provide a welcoming, "cozy" vibe while maintaining a professional geometric structure.
*   **Body (Be Vietnam Pro):** Used for `title`, `body`, and `label` scales. This is a clean, modern sans-serif that ensures legibility during long sessions of reading game descriptions or community threads.
*   **Hierarchy Note:** Use high-contrast sizing (e.g., `display-lg` at 3.5rem paired with `body-md` at 0.875rem) to create an editorial feel that guides the eye through the "Sanctuary."

## 4. Elevation & Depth
In this design system, hierarchy is expressed through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Stacking surface tiers creates a soft, natural lift. Place a `surface-container-lowest` card on a `surface-container-low` background to create an "inset" or "elevated" look without harsh shadows.
*   **Ambient Shadows:** When an element must float, use extra-diffused shadows. The shadow color should not be black, but a tinted version of `on-surface` (#f9e0df) at 5% opacity with a blur of 30px-50px.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** Use `surface_variant` with 40% transparency and a blur effect to create "frosted glass" panels. This allows the warmth of the background to bleed through the UI.

## 5. Components

### Buttons
*   **Primary:** Uses the `xl` (3rem) or `full` rounding. Styled with the signature sunset gradient (`primary` to `primary_container`). 
*   **Secondary:** Glassmorphic style using `secondary_container` with a `label-md` text color of `on_secondary_container`.
*   **States:** On hover, primary buttons should emit a soft glow using a `primary_dim` drop shadow.

### "Game Case" Cards
*   **Structure:** Cards must feel like physical media. Use `lg` (2rem) rounding.
*   **Separation:** Forbid dividers. Use `spacing-6` (2rem) to separate content blocks within a card.
*   **Interaction:** On hover, the card should scale slightly (1.02x) and transition from `surface-container-low` to `surface-container-highest`.

### Navigation
*   **The Floating Hearth:** The main navigation should be a floating bar, not pinned to the top. Use `surface_bright` with 80% opacity and `xl` rounding.
*   **Active State:** Use a `primary` sunset orange dot or a soft `secondary` lavender glow behind the active icon.

### Input Fields
*   **Style:** Backgrounds set to `surface_container_highest` with `md` (1.5rem) rounding. 
*   **Focus:** Instead of a heavy border, use a `primary` glow (`surface_tint`) to indicate focus.

### Chips & Filters
*   **Aesthetic:** Use `tertiary_container` (mint) for "Active" or "Online" states. All chips use `full` rounding to emphasize the friendly, non-tactical nature of the system.

## 6. Do's and Don'ts

### Do:
*   **Do** use `spacing-10` and `spacing-12` to give elements significant breathing room.
*   **Do** use subtle background glows (using `secondary_dim` or `primary_dim`) behind featured game cases to create a "halo" effect.
*   **Do** prioritize "Softness." Every corner should feel safe to touch (min radius `sm: 0.5rem`).

### Don't:
*   **Don't** use pure black (#000000) except for the `surface_container_lowest` in extreme high-contrast needs.
*   **Don't** use 1px dividers. If you need to separate content, use a background color shift or a `spacing-8` gap.
*   **Don't** use "Tactical Green" or "Military Red." Use `tertiary` (mint) for success and `error` (sunset-red #fe7453) for alerts.
*   **Don't** use sharp corners. Even the smallest UI element should have a minimum of `0.5rem` rounding.