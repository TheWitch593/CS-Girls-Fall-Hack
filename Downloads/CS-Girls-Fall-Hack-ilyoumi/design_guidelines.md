# Design Guidelines: Emotionally Intelligent AI Study Buddy

## Design Approach

**Hybrid Approach**: Material Design foundation with custom emotional warmth and personality. The application prioritizes emotional resonance while maintaining functional clarity for a chat-focused study tool.

**Key Principles**:
- Emotional warmth through soft, rounded interfaces
- Clear visual hierarchy for mood states and personas
- Breathing room to reduce cognitive load during study sessions
- Personality-driven components that feel supportive, not clinical

## Typography

**Font Families**:
- Primary: Inter (400, 500, 600) for UI elements and chat messages
- Accent: Poppins (600, 700) for headings, persona names, and emotional state labels

**Hierarchy**:
- Main headings: text-2xl to text-3xl, font-semibold (Poppins)
- Section titles: text-lg, font-medium (Inter)
- Chat messages: text-base, font-normal (Inter)
- Mood labels: text-sm, font-semibold, uppercase tracking-wide (Poppins)
- Helper text: text-sm, font-normal, reduced opacity

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, and 12 for consistent rhythm
- Tight spacing: p-2, gap-2 (chat bubbles, compact elements)
- Standard spacing: p-4, m-4, gap-4 (cards, form fields)
- Section spacing: p-6, p-8 (major containers)
- Generous spacing: p-12, mb-12 (page sections, vertical rhythm)

**Container Strategy**:
- Main chat area: max-w-4xl mx-auto
- Sidebar/persona selection: w-72 to w-80
- Full-width mood timeline: w-full with inner max-w-6xl

## Component Library

### Authentication & Onboarding
- **Login Screen**: Centered card (max-w-md) with Google auth button, welcoming headline, and subtle background gradient treatment
- **Persona Selection**: Grid of 3 persona cards (grid-cols-3 gap-4) with avatar illustrations, personality descriptor, and radio-style selection state

### Chat Interface
- **Layout**: Two-column on desktop (sidebar + chat), single column stacked on mobile
- **Message Bubbles**: 
  - User messages: align-right, rounded-2xl rounded-tr-sm, max-w-2xl
  - AI messages: align-left, rounded-2xl rounded-tl-sm, max-w-2xl
  - Mood-specific background treatments (subtle gradient overlays)
- **Input Area**: Fixed bottom bar with rounded-full text field, send button, and typing indicator
- **Typing Indicator**: Three animated dots inside AI bubble position

### Mood Detection System
- **Mood Timeline Bar**: Fixed top banner (h-16) showing color-coded mood progression as horizontal segments
- **Mood Badge**: Small pill badge (px-3 py-1 rounded-full text-xs) positioned above or within AI messages indicating detected state
- **Mood States**: Each has unique icon and color treatment:
  - Calm: Soft blue
  - Frustrated: Warm orange
  - Tired: Gentle purple
  - Motivated: Energetic green
  - Anxious: Muted yellow

### Session Management
- **Session Sidebar**: Left panel (w-72) with collapsible session list, each showing timestamp, mood summary icon, and preview text
- **Session Card**: rounded-lg border with hover state, p-4, displaying session date and emotional trend mini-visualization

### Buddy Persona Cards
- **Card Structure**: aspect-square or aspect-video, rounded-xl, border-2 when selected
- **Content**: Centered avatar (placeholder or illustration icon), persona name (text-lg font-semibold), 2-3 trait keywords (text-sm), selection indicator (checkmark or ring)

### Motivational Elements
- **Quote Card**: Appears inline in chat flow, distinct styling with rounded-xl, border-l-4, italic text, bg-opacity treatment
- **Break Suggestion**: Full-width gentle notification bar with icon, suggestion text, and dismiss/accept actions

### Navigation
- **Top Bar**: h-16 flex justify-between, logo/brand left, user avatar/settings right
- **Mobile Menu**: Hamburger icon revealing slide-in drawer for session history and settings

## Animations

**Minimal, purposeful animations only**:
- Typing indicator: gentle pulse animation (1.5s loop)
- Message appearance: subtle fade-in-up (200ms)
- Mood badge: scale-in when detected (150ms)
- Persona card selection: smooth border/background transition (200ms)

## Images

**Avatar/Persona Illustrations**:
- Three distinct, friendly avatar illustrations for persona selection (Mentor, Friendly, Calm)
- Style: Simple, modern, geometric or line-art illustrations conveying personality
- Placement: Center of persona selection cards, size: w-24 h-24 to w-32 h-32

**Optional Background**:
- Subtle gradient mesh or abstract shapes in authentication/onboarding screens for warmth (not photos)

**No hero images required** - this is a functional app, not a marketing page. Focus remains on the chat interface and emotional support tools.

## Accessibility

- WCAG AA contrast ratios for all mood-color combinations
- Keyboard navigation for chat input, persona selection, and session switching
- Screen reader labels for mood states and AI responses
- Focus indicators on all interactive elements (ring-2 ring-offset-2)