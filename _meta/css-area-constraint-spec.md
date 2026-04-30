# CSS Area Constraint Specification — ≤15% Brand Element Coverage

**Version:** 1.0  
**Date:** 2026-05-01  
**Scope:** FQST-009 Visual Bridge Layer Phase 3  
**Constraint:** Warm library accents ≤15% viewport coverage  

---

## Measurement Methodology

### Reference Viewport
- **Standard:** 1920×1080 desktop (primary measurement)
- **Mobile verification:** 375×667 iPhone SE (constraint must hold on both)
- **Total area calculation:** Width × Height pixels

### Element Inclusion Criteria

**INCLUDED in 15% calculation:**
- `.library-accent` class elements and children
- `.amber-glow` overlay effects  
- Brand color elements (#7D4450, #839E75, #E8AD4A)
- Warm accent decorative elements
- Knowledge state visual feedback elements

**EXCLUDED from calculation:**
- Core text content areas
- Navigation elements (.nav, .menu)
- Game interaction buttons
- User interface controls (.btn-primary, .choice-button)
- Background areas without accent styling

### Measurement Tools

**Browser DevTools Method:**
1. Open Chrome DevTools → Elements panel
2. Select target elements using `.library-accent, .amber-glow` selector
3. Right-click → "Inspect" → check computed width/height
4. Sum total branded element areas vs viewport area

**CSS Coverage Tool:**
1. DevTools → Coverage tab → record page interaction
2. Filter for brand-related CSS rules
3. Calculate affected element areas

**Automated Verification:**
```javascript
// Area calculation helper (browser console)
function calculateBrandedArea() {
    const brandElements = document.querySelectorAll('.library-accent, .amber-glow, [class*="brand-"], [style*="#7D4450"], [style*="#839E75"], [style*="#E8AD4A"]');
    let totalArea = 0;
    
    brandElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        totalArea += rect.width * rect.height;
    });
    
    const viewportArea = window.innerWidth * window.innerHeight;
    return {
        brandedArea: totalArea,
        viewportArea: viewportArea,
        percentage: (totalArea / viewportArea * 100).toFixed(2)
    };
}
```

### State Considerations

**Must measure across all states:**
- **Static load:** Initial page view
- **Hover effects:** Interactive element hover states  
- **Active glow:** Knowledge discovery amber overlay active
- **Mobile responsive:** Constraint holds on mobile breakpoints

### Compliance Verification

**Success Criteria:**
- Desktop (1920×1080): ≤15.0% brand element coverage
- Mobile (375×667): ≤15.0% brand element coverage
- All interaction states: ≤15.0% in any state
- Measurement precision: ±0.1% tolerance

**Failure Triggers:**
- Any viewport size >15.0% brand coverage
- Mobile responsive breakage of constraint
- Hover/active states exceeding 15.0%

### Documentation Requirements

**Per measurement session:**
1. Screenshot with elements highlighted
2. Console output of calculation function
3. DevTools computed values screenshot
4. Mobile verification screenshots

**Audit Trail:**
- Measurement date/time
- Browser version (Chrome recommended)
- Viewport size verified
- Assessment result (PASS/FAIL/percentage)

---

## Implementation Guidelines

### CSS Class Strategy
```css
/* Brand accent elements must use specific classes for measurement */
.library-accent {
    /* Warm library styling */
}

.amber-glow {
    /* Knowledge state overlay */
}

.brand-element {
    /* FolkUp brand integration */
}
```

### Area Optimization Tips
- Use `border-radius`, `box-shadow` for visual impact with minimal area
- Prefer `background-image` gradients over solid color blocks  
- Implement glow effects with `filter: drop-shadow()` instead of large elements
- Use `::before`, `::after` pseudo-elements for decorative accents

---

**Measurement Responsible:** Фонарщик (brand verification) + Johnny (technical measurement)  
**Quality Gate:** Must PASS before Visual Bridge Layer implementation completion