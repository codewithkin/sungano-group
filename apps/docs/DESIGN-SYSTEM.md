## Design System (Light Only)

Source: provided sign-in mock (mint/white, clean, rounded). Dark mode is not supported.

### Palette
- Primary: #16A34A (buttons, links, highlights)
- Primary Gradient: #16A34A → #7CD49A with soft overlay (#D5F5E4 at 70%)
- Background: #F5F7F4
- Surface / Card: #FFFFFF
- Border: #E5E7EB
- Text Primary: #0F172A
- Text Muted: #4B5563
- Icon Muted: #94A3B8
- Success: #16A34A; Danger: #EF4444; Warning: #F59E0B

### Typography
- Font: Inter (or system fallback)
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
- Card radius: 16px
- Input / Button radius: 8px
- Shadow (cards/overlays): 0 12px 40px rgba(0,0,0,0.08)
- Input height: 48px (h-12); Button height: 48px (h-12)

### Components
- Buttons: Solid primary (#16A34A) on white; 48px height; 8px radius; hover darken by ~6%; disabled lowers opacity; text 16/20 semibold
- Inputs: 48px height; soft border (#E5E7EB), radius 8px, padding 12px 16px; focus ring #16A34A at 2px; optional left icon with 4px gutter
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
