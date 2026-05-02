---
name: Clinical Sophistication
colors:
  surface: '#fafaf3'
  surface-dim: '#dadad4'
  surface-bright: '#fafaf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4ed'
  surface-container: '#eeeee7'
  surface-container-high: '#e8e9e2'
  surface-container-highest: '#e3e3dc'
  on-surface: '#1a1c18'
  on-surface-variant: '#45483f'
  inverse-surface: '#2f312d'
  inverse-on-surface: '#f1f1ea'
  outline: '#75786e'
  outline-variant: '#c5c8bc'
  surface-tint: '#536343'
  primary: '#384729'
  on-primary: '#ffffff'
  primary-container: '#4f5f3f'
  on-primary-container: '#c6d8b0'
  inverse-primary: '#bacda5'
  secondary: '#655d50'
  on-secondary: '#ffffff'
  secondary-container: '#e9decd'
  on-secondary-container: '#696254'
  tertiary: '#424342'
  on-tertiary: '#ffffff'
  tertiary-container: '#595a59'
  on-tertiary-container: '#d2d1d0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e9c0'
  primary-fixed-dim: '#bacda5'
  on-primary-fixed: '#121f06'
  on-primary-fixed-variant: '#3c4b2d'
  secondary-fixed: '#ece1d0'
  secondary-fixed-dim: '#d0c5b5'
  on-secondary-fixed: '#201b11'
  on-secondary-fixed-variant: '#4d4639'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fafaf3'
  on-background: '#1a1c18'
  surface-variant: '#e3e3dc'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  section-padding: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system embodies the intersection of medical precision and premium hospitality. Designed for 'TMC Medical Vietnam,' the aesthetic moves away from the typical clinical coldness, instead adopting a "Bright & Airy" minimalist style reminiscent of high-end consumer technology interfaces.

The brand personality is authoritative yet tranquil. It targets a discerning clientele looking for professional dermatological results in a serene, curated environment. The visual language utilizes **Minimalism** as its core movement—prioritizing essentialism, significant whitespace, and a sophisticated, organic color palette. The goal is to evoke trust through clarity and a sense of "quiet luxury" through restraint.

## Colors

The palette is rooted in nature and clinical cleanliness. 

- **Primary Background (#FFFFFF):** Used for the vast majority of the interface to maintain a "high-end clinic" feel and maximize light.
- **Primary Brand (#4F5F3F):** A deep, muted olive green. This is the "voice" of the brand, reserved for primary actions, headings, and significant brand moments. It provides a grounded, organic contrast to the white space.
- **Secondary (#E8DDCC):** A soft cream-beige used for container backgrounds, section subtle-fills, and secondary UI elements. It softens the high contrast between the white and green.
- **Tertiary/Surface (#F9F8F6):** An ultra-light off-white for subtle layering and card backgrounds where the cream might be too heavy.
- **Neutral (#1A1C18):** A near-black with a hint of green tint for body text, ensuring maximum legibility without the harshness of pure black.

## Typography

**Manrope** is selected for its geometric yet modern feel, bridging the gap between technical precision and approachable elegance. 

The hierarchy is built for deep scannability and SEO performance. Headlines use a tighter letter-spacing and heavier weights to command attention, while body text utilizes generous line heights (1.6) to ensure a comfortable reading experience for medical information. Large "Hero" typography should be used sparingly to maintain the minimalist aesthetic. A specialized "Label-Caps" style is used for eyebrows and small metadata to provide a structured, editorial feel.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to maintain a premium, composed look, transitioning to a fluid model for tablet and mobile. 

The layout relies on a 12-column grid with a wide 24px gutter. A hallmark of this system is the use of "Extreme Whitespace." Section vertical padding is intentionally large (120px+) to allow the content to breathe and to signal a premium, unhurried brand experience. Components follow an 8px base unit rhythm to ensure mathematical harmony across all screen sizes.

## Elevation & Depth

To maintain the "Bright & Airy" feeling, elevation is handled with extreme subtlety. 

- **Tonal Layering:** Depth is primarily achieved by placing #FFFFFF cards on #F9F8F6 or #E8DDCC backgrounds.
- **Ambient Shadows:** Shadows should be almost imperceptible. Use a very large blur radius (30px-50px) with very low opacity (3-5%) using a tint of the primary green (#4F5F3F) instead of pure black. This creates a soft, "lifting" effect rather than a heavy drop shadow.
- **Zero-Depth States:** Buttons and inputs remain flat or use subtle 1px borders in their default state to maintain the Apple-style minimalist aesthetic.

## Shapes

The shape language is "Softly Architectural." 

We use **Level 2 (Rounded)** settings. Standard buttons and input fields feature an 8px (0.5rem) radius. Larger containers, such as clinical service cards or hero images, use a 16px (1rem) or 24px (1.5rem) radius. This approach avoids the "juvenile" feel of fully pill-shaped elements while ensuring the interface feels approachable and modern rather than sharp and clinical.

## Components

- **Buttons:** Primary buttons are solid Olive (#4F5F3F) with White text. Secondary buttons use an Olive border with Olive text. Hover states should involve a subtle shift in saturation rather than brightness.
- **Cards:** Used for treatment listings and blog posts. Cards should have a #FFFFFF background with a 1px border of #E8DDCC or a very soft ambient shadow. 
- **Input Fields:** Minimalist design with a bottom border or a very light #F9F8F6 fill. Labels remain small and persistent.
- **Chips/Badges:** Used for treatment categories (e.g., "Dermatology", "Aesthetics"). Use #E8DDCC backgrounds with #4F5F3F text.
- **Navigation:** A sticky, transparent-to-white blur (Apple-style backdrop-filter) with the logo centered or left-aligned.
- **Specialty Component - "The Clinical Carousel":** A horizontal scrolling area for medical results or equipment showcases, utilizing large rounded images and generous captions.