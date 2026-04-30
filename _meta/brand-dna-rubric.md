# Brand DNA Measurement Rubric — FolkUp Quest Visual Bridge Layer

**Version:** 1.0  
**Date:** 2026-05-01  
**Scope:** FQST-009 Visual Bridge Layer Phase 3 assessment  
**Target Score:** ≥75/100  

---

## Measurement Framework (100 points total)

### 1. **Visual Palette Integration** (25 points)
- **Bordeaux (#7D4450) presence:** Appropriate use in accent elements (10 pts)
- **Sage (#839E75) balance:** Warm library tones without gaming disruption (8 pts)  
- **Amber (#E8AD4A) glow:** Knowledge state visual feedback implementation (7 pts)

### 2. **Typography Harmony** (20 points)
- **Scholar aesthetics:** Playfair Display integration with gaming UI (10 pts)
- **Readability preservation:** Source Sans 3 maintains gaming functionality (10 pts)

### 3. **Gaming Experience Preservation** (25 points)
- **Core interaction:** Text adventure mechanics unimpacted (15 pts)
- **Performance:** Frame rate, load times maintain baseline (10 pts)

### 4. **Library Soul Atmosphere** (15 points)
- **Warm accents:** Scholar's study feeling within ≤15% constraint (8 pts)
- **Knowledge glow:** Amber overlay enhances discovery experience (7 pts)

### 5. **Technical Implementation Quality** (15 points)
- **WCAG compliance:** Contrast ratios ≥4.5:1 maintained (8 pts)
- **Cross-platform:** Consistent rendering on mobile/desktop (7 pts)

---

## Assessment Protocol

### Measurement Authority
- **Primary Assessor:** Фонарщик (brand expert)
- **Technical Verification:** Johnny (WCAG + implementation)
- **Gaming Validation:** Independent gaming experience tester

### Area Constraint Definition (≤15%)
- **Measurement Basis:** Viewport coverage percentage at 1920×1080 reference
- **Calculation Method:** CSS inspector tool measuring branded element area vs total viewport
- **Includes:** Hover states, active overlays, glow effects
- **Excludes:** Core gaming text, interaction buttons, navigation

### Success Criteria
- **Minimum passing:** 75/100 total score + all subsections ≥60% individual score
- **Regression threshold:** Gaming performance ≤5% degradation from FQST-008 baseline
- **Quality gate:** WCAG 2.1 AA compliance maintained

---

## Rollback Protocol

**Triggers:**
- Total score <75/100 after implementation
- Gaming performance degradation >5%  
- WCAG compliance failure
- User experience regression detected

**Procedure:**
1. Revert to FQST-008 git commit state
2. Document failure analysis in `_meta/fqst-009-failure-report.md`
3. Reassess approach with expert panel before retry

---

**Assessment Date:** ___________  
**Assessor:** ___________  
**Score:** _____ / 100  
**PASS/FAIL:** ___________  