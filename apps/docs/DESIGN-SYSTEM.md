## Design System (Light Only)

Source: provided sign-in mock (mint/white, clean, rounded). Dark mode is not supported.

### Palette
 Primary: #0F4FA8 (buttons, links, highlights)
 Primary Gradient: #0F4FA8 → #5BA7FF with soft overlay (#E7F0FB at 70%)
 Background: #F6F8FB
 Accent: #E7F0FB
- Border: #E5E7EB
 Card radius: 16px
 Input / Button radius: 12px
 Shadow (cards/overlays): 0 12px 40px rgba(0,0,0,0.08)
 Input height: 48px (h-12); Button height: 48px (h-12)

 Buttons: Solid primary (#0F4FA8) on white; 48px height; 12px radius; hover darken by ~6%; disabled lowers opacity; text 16/20 semibold
 Inputs: 48px height; soft border (#E5E7EB), 12px radius, padding 12px 16px; focus ring #0F4FA8 at 2px; optional left icon with 4px gutter
- Headings: Medium/Semibold, tight leading
  - H1: 32/38, H2: 24/30, H3: 20/26
- Body: 16/24 regular; Muted: 14/22
- Buttons: 16/20 semibold, uppercase not required

### Spacing & Layout
- Grid spacing: 8px base; common steps 8/12/16/24/32
- Card padding: 24–32px; Auth card: 32px vertical rhythm
- Form gaps: 12–16px between fields; 8px between label and control
- Max widths: Auth card ~420px content width; Page content 960–1200px
- Sections: 32–48px vertical spacing

### Corners & Shadows
- Card radius: 16px (rounded-2xl)
- Input / Button radius: 16px (rounded-2xl)
- Shadow (cards/overlays): 0 12px 40px rgba(0,0,0,0.08)
- Input height: 48px (h-12); Button height: 48px (h-12)

### Components
- Buttons: Solid primary (#0F4FA8) on white; 48px height; 16px radius; hover darken by ~6%; disabled lowers opacity; text 14/20 semibold
- Inputs: 48px height; soft border (#E5E7EB), 16px radius, padding 12px 16px; focus ring #0F4FA8 at 2px; optional left icon with 4px gutter
- Cards: White surface, 16px radius, soft shadow, 24–32px padding
- Links: Primary green, underline on hover
- Badges/Pills: Light green background (#E6F7ED) with primary text
- Divider: 1px #E5E7EB with 16px vertical margin; text dividers use "OR" in muted 12px
- Iconography: Lucide/outline, 16–20px, muted color (#94A3B8); circular icon badges use 48px badge on accent background

### Layout Guidance
- Auth: Centered card on light background with right-side hero/gradient allowed; primary CTA above SSO; inline text links in muted copy
- Navigation: Light sidebar/topbar, clear section labels, ample spacing; avoid dark mode toggles
- Tables/Lists: Striped or light borders; hover background #F7FAF8; consistent 12px cell padding

### Accessibility
- Minimum contrast: 4.5:1 for text on surfaces
- Focus: Visible 2px ring using primary color on interactive elements
