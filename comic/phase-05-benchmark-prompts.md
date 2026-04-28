# Phase 0.5 Benchmark — Flux 2 Pro Prompts

> **Дата:** 28.04.2026  
> **Цель:** Validate production-grade quality (6-8/10 target)  
> **Engine:** Flux 2 Pro (Replicate)  
> **Status:** READY FOR EXECUTION

## Technical Specifications

**Flux 2 Pro Parameters:**
- `aspect_ratio`: varies per panel
- `output_format`: "png"
- `output_quality`: 100
- `seed`: random for variety testing
- Reference images: up to 8 per generation
- Prompt length: up to 32K tokens

**Sin City Style Requirements:**
- Pure black and white, NO gray tones, NO halftones
- High contrast ink wash style
- Negative space: figures defined by what's NOT drawn
- Spotted blacks (large areas of pure black)
- White silhouettes on black backgrounds
- Splatter technique for rain/texture

---

## Panel 1.1 — Shore Splash (TIER 1)

**Aspect Ratio:** 2:3 (portrait, full page)  
**Scene:** Setúbal waterfront, establishing shot  
**Camera:** Wide establishing, 30° bird's eye  

### Master Prompt

```
Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones. 

SCENE: Setúbal Portugal waterfront establishing shot. Wide angle 30-degree bird's eye view.

MAIN SUBJECT: Thin wiry man in his late 30s with ponytail and short beard, wearing black leather jacket with raised collar, slouching posture. White silhouette figure sitting on black bench. Man appears small in composition, positioned lower third.

BACKGROUND ELEMENTS:
- Atlantic Ocean horizon line at 50% height of image
- 7 seagulls scattered as white dots/shapes of varying sizes across sky
- 3-4 fisherman silhouettes on distant horizon with fishing nets (horizontal arc shapes)
- Waterfront promenade with black geometric shapes
- Bench with visible paint layers (3 white stripes/chipped paint detail)

STYLE DETAILS:
- Spotted blacks technique for large areas
- White silhouettes on black backgrounds
- Negative space defines forms
- High contrast, no halftones
- Clean ink wash aesthetic
- Minimal detail, maximum impact through silhouette

MOOD: Contemplative, noir, establishing loneliness. Silent scene with strong compositional geometry.

TECHNICAL: 
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Comic book panel format
- Frank Miller style composition
```

**Expected Elements Check:**
- [ ] Арни silhouette (thin, wiry, ponytail, leather jacket)
- [ ] 7 seagulls as white dots
- [ ] Atlantic horizon at 50% height
- [ ] Fishermen silhouettes with nets
- [ ] Bench with chipped paint detail
- [ ] Sin City B&W style adherence

---

## Panel 2.3 — Bar Glasses (TIER 1)

**Aspect Ratio:** 3:1 (wide horizontal)  
**Scene:** Interior bar, Арни with 7 empty glasses  
**Camera:** Medium shot, side angle, eye level  

### Master Prompt

```
Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Interior bar scene, medium shot from side angle at eye level.

MAIN SUBJECT: Thin wiry man with ponytail and beard, wearing black leather jacket. Head resting on crossed arms on bar counter. White figure against black background. Posture shows defeat, exhaustion.

FOREGROUND ELEMENTS:
- 7 empty glasses arranged on dark bar surface
- Glasses have varying heights and distances between them
- Pattern feels organic, not geometric (echoing seagull placement)
- One glass slightly tipped/on side
- Glasses are white/light shapes against dark bar surface

BACKGROUND ELEMENTS:
- Bartender as black silhouette figure in background
- Bar shelves with bottle silhouettes
- Minimal bar interior details
- Strong contrast between foreground (glasses) and background

STYLE DETAILS:
- High contrast ink wash
- White shapes (glasses, figure) on black backgrounds
- Spotted blacks for bar surface and background
- Clean negative space definition
- Minimal detail, maximum emotional impact

MOOD: Rock bottom, despair, repetition/pattern suggesting obsessive counting. Silent contemplation.

TECHNICAL:
- Pure black and white only
- No gray tones  
- High contrast ink illustration
- Wide horizontal panel format
- Frank Miller compositional style
```

**Expected Elements Check:**
- [ ] Арни in defeated posture (head on arms)
- [ ] 7 empty glasses with varied positioning  
- [ ] Pattern echoes seagulls but not geometric
- [ ] Bartender silhouette in background
- [ ] Sin City B&W contrast

---

## Panel 5.1 — Library Splash (TIER 1) 

**Aspect Ratio:** 2:3 (portrait, full page)  
**Scene:** Claustrophobic library interior  
**Camera:** Low angle from floor looking up  

### Master Prompt

```
Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Library interior, claustrophobic composition. Low angle shot from floor level looking upward.

MAIN SUBJECT: Small silhouette figure of thin wiry man at bottom center of composition. Figure appears tiny, dominated by surrounding architecture.

ARCHITECTURE ELEMENTS:
- Towering bookshelves creating claustrophobic vertical compression
- Empty shelves stretching wall-to-wall
- Shelves create strong vertical lines converging upward
- NOT cathedral-like, but oppressive and confining

KEY FOCAL POINT:
- Single lamp with root-like branches/organic curves
- Only rounded/organic form in geometric space
- Warm white glow emanating from lamp (represented as white negative space)
- Lamp positioned to create dramatic lighting contrast

BACKGROUND ELEMENTS:
- Three doors visible as dark rectangular shapes in deep background
- Geometric shelf patterns creating perspective lines
- Strong vertical emphasis throughout composition

STYLE DETAILS:
- Heavy use of black negative space
- White silhouette figure against black environment
- Geometric architectural forms vs organic lamp
- Dramatic perspective creating scale/intimidation
- Minimal detail, maximum atmospheric impact

MOOD: Isolation, knowledge overwhelming human scale, mysterious portal feeling.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration  
- Vertical full-page panel format
- Frank Miller dramatic perspective
```

**Expected Elements Check:**
- [ ] Claustrophobic vertical compression
- [ ] Арни as tiny silhouette at bottom
- [ ] Lamp with organic root-like design
- [ ] Empty shelves wall-to-wall
- [ ] Three doors in background
- [ ] Low angle dramatic perspective

---

## Panel 8.1 — Alice Reveal (TIER 1)

**Aspect Ratio:** 3:1 (wide horizontal)  
**Scene:** Alice face reveal with spot color  
**Camera:** Medium close-up, frontal, eye level  

### Master Prompt

```
Comic book panel in Frank Miller Sin City style. Pure black and white with SINGLE spot color accent, high contrast ink wash.

SCENE: Character reveal scene, medium close-up frontal view at eye level.

MAIN SUBJECT: Young woman in her mid-20s, Rooney Mara facial type. Perfect bilateral facial symmetry. Hair pulled back tightly, never loose. Beautiful but unsettling "something not quite right" quality.

KEY TECHNICAL DETAIL:
- Machine-precision contour: SINGLE CLEAN LINE outline (NOT hand-drawn feel)
- Contrast with typical comic art: this character has vector-like precision
- Perfect geometric symmetry in facial features
- Unnaturally precise posture and positioning

SPOT COLOR ELEMENT:
- Brick-red notebook in her hands (sage #839E75 color)
- ONLY the notebook receives color treatment
- Everything else pure black and white
- Notebook is focal point drawing eye

BACKGROUND ELEMENTS:
- Minimal background, focus on character
- Strong contrast to emphasize the precise lineart
- Geometric precision vs organic environment

STYLE DETAILS:
- High contrast ink wash for background
- Machine-precision single line for character outline
- Perfect symmetry unusual for comic art
- Spot color draws attention to notebook
- Clinical precision vs human warmth

MOOD: Uncanny valley effect, AI/artificial hints, intelligence, slight unease. Perfect but not quite human.

TECHNICAL:
- Pure black and white base
- Single spot color (sage #839E75) on notebook only
- Machine precision contour for character
- High contrast ink illustration
- Wide horizontal panel format
```

**Expected Elements Check:**
- [ ] Rooney Mara facial type
- [ ] Machine-precision single line contour (unusual for comics)
- [ ] Perfect bilateral symmetry
- [ ] Hair pulled back tightly
- [ ] Sage #839E75 spot color on notebook ONLY
- [ ] Uncanny valley subtle effect

---

## Panel 9.1 — Arni Leaving (TIER 1)

**Aspect Ratio:** 3:2 (wide rectangle, half-page)  
**Scene:** Арни walking away from Alice  
**Camera:** Wide shot, eye level, following behind  

### Master Prompt

```
Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Urban London Barnes area, wide shot following character from behind at eye level.

MAIN SUBJECT: Thin wiry man with ponytail walking away, back to viewer. Black leather jacket with raised collar. Figure positioned left-of-center in composition, creating sense of movement and departure.

BACKGROUND FIGURE:
- Small female silhouette on bench in far background
- Positioned at opposite end of panel width  
- Creates maximum distance/separation feeling
- She remains stationary while he moves away

ENVIRONMENT ELEMENTS:
- Rain falling (white diagonal lines/splatter technique)
- Thames river elements
- Brick dust in air (small white particles)
- London Barnes architecture silhouettes
- Urban landscape creating depth

COMPOSITIONAL EMPHASIS:
- Wide panel format emphasizes distance/separation
- Horizontal composition showing gulf between characters
- Movement from foreground (Arni) to background (Alice)
- Environmental details support mood of separation

STYLE DETAILS:
- Splatter technique for rain texture
- White silhouettes against dark urban environment
- Spotted blacks for architecture and pavement
- Negative space defines moving figure
- Atmospheric perspective through rain/particles

MOOD: Departure, separation, choice made, melancholy. Distance both physical and emotional.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Wide horizontal panel format
- Frank Miller atmospheric storytelling
```

**Expected Elements Check:**
- [ ] Арни walking away (back view)
- [ ] Alice silhouette distant on bench
- [ ] Maximum distance across panel width
- [ ] Rain with white diagonal splatter
- [ ] Thames/London Barnes environment
- [ ] Atmospheric separation mood

---

## Execution Protocol

### Step 1: Generation Parameters
For each panel, use Flux 2 Pro with:
- Prompt: Use master prompt above
- Aspect ratio: As specified per panel
- Output quality: 100
- Output format: PNG
- Seed: Random (test variety)
- Reference images: None for benchmark (pure prompt test)

### Step 2: Quality Assessment Criteria

**Technical Standards (6-8/10 minimum):**
- [ ] Sin City style adherence (pure B&W, high contrast)
- [ ] Character accuracy (Арни appearance consistency)
- [ ] Compositional strength (camera angles, layout)
- [ ] Environmental accuracy (Setúbal, bar, library, Barnes details)
- [ ] Emotional impact/mood capture

**Production Decision Matrix:**
- **8-10/10:** AI-first approach approved, proceed to full production
- **6-7/10:** Conditional approval, may need post-production enhancement
- **Below 6/10:** Hybrid or professional approach required

### Step 3: Documentation
Document each generation with:
- Final prompt used
- Quality score (1-10)
- Technical notes (strengths/weaknesses)
- Post-production recommendations
- Production approach recommendation

### Step 4: Production Decision
Based on aggregate scores:
- Generate final production recommendation
- Identify any technical modifications needed
- Propose timeline for chosen approach
- Activate 7-expert team structure if approved

---

*Generated: 28.04.2026 — Phase 0.5 benchmark protocol ready for execution*