---
name: Vibrant Scholastic
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434656'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ee8'
  primary: '#0042c8'
  on-primary: '#ffffff'
  primary-container: '#0056ff'
  on-primary-container: '#e4e7ff'
  inverse-primary: '#b6c4ff'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fdd400'
  on-secondary-container: '#6f5c00'
  tertiary: '#005d3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00784c'
  on-tertiary-container: '#8fffc1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab2'
  secondary-fixed: '#ffe170'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#50ffaf'
  tertiary-fixed-dim: '#00e293'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005232'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The brand personality is high-energy, optimistic, and intellectually stimulating, specifically tailored for the **Nihol** initiative. It moves away from passive pastels toward a proactive, "punchy" aesthetic that celebrates learning as an active adventure.

The design style merges **Modern Minimalism** with **Tactile Vibrancy**. It utilizes a pure white canvas to allow saturated, electric hues to pop, creating a sense of clarity and focus. The UI should evoke a "joyful precision"—professional enough for an educational platform, but playful enough to engage young learners and educators. Key characteristics include thick, soft colorful shadows that give elements a "floating" physical presence and high-contrast interactions.

## Colors
The palette is built on high-saturation "Electric" tones to drive engagement and visual hierarchy.

- **Electric Blue (Primary):** Used for primary actions, navigational anchors, and brand-critical information. It represents stability and intelligence.
- **Sunny Yellow (Secondary):** Used for highlights, achievement markers, and attention-grabbing elements. High contrast against white.
- **Vivid Mint (Tertiary):** Used for success states, progress indicators, and creative modules. 
- **Bright Coral (Quaternary):** Used for urgent notifications, interactive "fun" zones, and decorative accents.
- **Pure White Background:** The foundational surface (#FFFFFF) ensures that the saturated colors remain legible and the interface feels spacious.

## Typography
The system uses **Plus Jakarta Sans** across all levels to maintain a friendly, contemporary, and highly legible feel. 

Headlines are set with heavy weights (Bold to ExtraBold) and tight letter spacing to create "impact blocks" of color and text. Body text maintains a medium weight for enhanced readability against high-vibrancy accents. Mobile overrides are essential for the extra-large display type to ensure the interface remains accessible on smaller devices without losing its bold character.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous white space to balance the high-intensity colors. 

- **Desktop:** 12-column grid with 24px gutters. Content is centered with wide 64px margins to create a "premium app" feel.
- **Mobile:** 4-column grid with 16px margins. 
- **Rhythm:** An 8px base unit governs all padding and margins. Vertical stacking uses large gaps (48px+) between major sections to prevent the vibrant elements from feeling cluttered. Elements should feel "airy" and unconstrained.

## Elevation & Depth
Depth in this design system is achieved through **Colorful Ambient Shadows** rather than traditional grey shadows.

Surfaces do not use borders; instead, they are separated from the pure white background by thick, soft-focus shadows tinted with the primary or secondary color (e.g., a card may have a soft #0056FF shadow at 15% opacity). 

- **Low Elevation:** 4px blur, 2px offset. Used for interactive buttons.
- **High Elevation:** 24px blur, 12px offset. Used for floating cards and modals.
- **Shadow Color:** Always match the shadow tint to the element's primary accent or a neutral blue-grey for standard white cards to maintain the "vibrant" theme.

## Shapes
Shapes are unapologetically rounded to maintain a friendly and safe atmosphere for education. 

Standard components (buttons, inputs) use a 0.5rem (8px) radius. Larger containers like cards and content modules use "rounded-xl" at 1.5rem (24px) to emphasize the soft, tactile nature of the UI. Avoid sharp corners entirely to stay consistent with the **Nihol** inviting aesthetic.

## Components
- **Buttons:** Large, high-contrast blocks. The primary button is Electric Blue with white text and a thick, soft blue shadow. On hover, the shadow intensity increases.
- **Cards:** Pure white background with a 1.5rem corner radius. Use a colorful "top-bar" or "side-accent" in Sunny Yellow or Vivid Mint to categorize content.
- **Chips:** Saturated backgrounds with high-contrast text (e.g., Bright Coral chip with White text). Fully pill-shaped.
- **Input Fields:** White fill with a thick 2px light-grey border that turns Electric Blue on focus. No shadows on resting state, but a soft glow on focus.
- **Progress Bars:** Thick, rounded tracks using a 20% opacity version of the color, with a 100% saturated "Vivid Mint" fill for the progress indicator.
- **Interactive Icons:** Housed in rounded-square containers with secondary colors (e.g., a Sunny Yellow box with a white icon).