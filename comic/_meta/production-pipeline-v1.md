# Chapter 1 Production Pipeline v1 — Operational Framework

> **Authority:** Level 3 Cartouche Autonome  
> **Mission:** Execute 28-panel Chapter 1 with streamlined 3-specialist approval  
> **Budget:** $50-90 (iteration buffer model)  
> **Target:** ≥7.6/10 quality average (Phase 0.5 benchmark)  
> **Team:** Фонарщик (visual) + Johnny (technical) + КиберГонзо (editorial)

## Pipeline Overview

### Single-Gate Approval Process
**Streamlined from 7-expert to 3-specialist model per Beta supervisor requirement**

**Key Optimization:** 3 communication pairs vs 21 in original 7-expert model  
**Efficiency Gain:** Single approval gate vs parallel expert bottlenecks  
**Quality Assurance:** Proven Phase 0.5 workflow scaled to production volume

---

## Batch Structure Framework

### Batch Specifications
- **Size:** 3-4 panels per batch (proven in Phase 0.5)
- **Sequencing:** Story chronological order (panels 1-28)
- **Timeline:** 1-2 hours per batch including review
- **Budget Allocation:** Maximum $10 per batch

### Batch Planning Protocol
1. **Panel Selection:** Next 3-4 chronological panels
2. **Prompt Preparation:** Master prompts + character consistency references
3. **Resource Assembly:** Technical specs + quality standards + narrative context
4. **Generation Parameters:** Flux 2 Pro settings confirmed
5. **Review Scheduling:** 30 min specialist window + 15 min convergence

### Batch Sequencing Strategy
```
Batch 1: Panels 1-3 (Pilot/Validation)
Batch 2: Panels 4-7 (First Full Batch)
Batch 3: Panels 8-11 (Character Development)
Batch 4: Panels 12-15 (Midpoint Sequence)
Batch 5: Panels 16-19 (Rising Action)
Batch 6: Panels 20-23 (Climax Approach)
Batch 7: Panels 24-27 (Resolution)
Batch 8: Panel 28 (Conclusion/Buffer)
```

---

## Single Approval Gate Workflow

### Stage 1: Generation Complete
**Objective:** All batch panels generated and ready for review  
**Timeline:** Variable based on generation success rate (70% first-pass assumption)  
**Output:** 3-4 completed panel files + generation metadata

**Generation Checklist:**
- [ ] All panels in batch generated
- [ ] Files properly named and stored
- [ ] Generation parameters logged
- [ ] Any regenerations documented
- [ ] Ready for specialist review

### Stage 2: Specialist Review Cycle  
**Timeline:** 30 minutes simultaneous review  
**Process:** All 3 specialists review independently

#### Фонарщик (Visual Review)
- Character consistency scoring (≥7/10 vs baselines)
- Sin City style compliance verification
- Brand Guide v2.5 adherence check
- Visual quality assessment

#### Johnny (Technical Review)  
- 5-dimension rubric scoring (weighted average ≥7.0/10)
- Technical quality verification (artifacts, resolution, optimization)
- File format and specification compliance
- Optimization recommendations

#### КиберГонзо (Editorial Review)
- Content safety compliance verification
- Narrative consistency assessment
- Character development appropriateness
- Story beat execution evaluation

### Stage 3: Convergence Meeting
**Timeline:** 15 minutes maximum  
**Process:** Specialists discuss findings and reach consensus

#### Decision Matrix
| Фонарщик | Johnny | КиберГонзо | Batch Decision |
|----------|---------|------------|----------------|
| PASS | PASS | PASS | **APPROVE** → next batch |
| PASS | PASS | FAIL | **ITERATE** → editorial fixes |
| PASS | FAIL | PASS | **ITERATE** → technical regeneration |
| FAIL | PASS | PASS | **ITERATE** → visual consistency |
| FAIL | FAIL | PASS | **ESCALATE** → major problems |
| Any 3 FAIL | **ESCALATE** → systematic failure |

#### Convergence Outcomes
- **APPROVE:** All panels meet standards, proceed to next batch
- **ITERATE:** Specific panels regenerated with corrections
- **ESCALATE:** Systematic issues require process review

### Stage 4: Go/No-Go Decision
**Authority:** Алиса based on specialist consensus  
**Options:** Approve batch, iterate specific panels, or escalate

#### Approval Criteria
- Weighted average ≥7.0/10 AND no dimension <5/10 (per panel)
- All specialist gates: PASS
- Budget within $10 batch allocation
- Quality trend maintained (no degradation)

#### Iteration Protocols
- **Maximum attempts:** 2 regenerations per panel before escalation
- **Enhanced prompts:** Character consistency emphasis + specialist feedback
- **Budget tracking:** Regeneration costs monitored against $10 batch limit

#### Escalation Triggers
- 3 consecutive panels below 7/10 quality
- Budget overrun beyond iteration buffer
- Systematic quality degradation
- Expert specialist unanimous FAIL

### Stage 5: Documentation & Preparation
**Timeline:** 10 minutes post-decision  
**Process:** Update tracking, prepare next batch

#### Documentation Requirements
- Batch completion status and quality scores
- Individual panel assessments and decisions
- Budget expenditure and remaining allocation
- Quality trend analysis
- Next batch preparation

---

## Quality Assurance Framework

### Individual Panel Standards
**From Quality Rubric v2 (Johnny technical authority):**

1. **Sin City Style** (25% weight) — Threshold: ≥6/10
2. **Character Accuracy** (25% weight) — Threshold: ≥7/10
3. **Composition** (20% weight) — Threshold: ≥6/10  
4. **Technical Quality** (15% weight) — Threshold: ≥7/10
5. **Narrative Impact** (15% weight) — Threshold: ≥6/10

**Panel Approval:** Weighted average ≥7.0/10 AND no dimension <5/10

### Character Consistency Integration
**From Character Consistency Sheets v1 (Фонарщик visual authority):**

- **Alice panels:** ≥7/10 consistency vs Panel 8.1 canonical
- **Арни panels:** ≥7/10 consistency vs Panel 1.1+2.3 composite
- **Style compliance:** ≥6/10 vs Panel 5.1 Sin City anchor

### Batch-Level Quality Gates
- **All panels** must meet individual thresholds
- **Trend monitoring:** Flag downward movement >0.5 points between batches
- **Escalation trigger:** 3 consecutive panels <7/10

### Chapter-Level Quality Targets
- **Final average:** ≥7.6/10 across 28 panels (Phase 0.5 benchmark)
- **Consistency maintenance:** No systematic degradation
- **Evidence documentation:** Complete generation manifest

---

## Budget Management Integration

### Budget Allocation Model
**Total Budget:** $50-90 with iteration buffer

#### Monitoring Checkpoints
- **$60 (50% mark):** Review batch performance trajectory
- **$75 (75% mark):** Final assessment before abort trigger
- **$90 (hard ceiling):** Immediate abort, escalate to Андрей

#### Batch Budget Controls
- **Base allocation:** $10 per batch (3-4 panels)
- **Regeneration limits:** Max 2 per panel before escalation
- **Abort threshold:** >$15 spent with <6/10 quality

#### Cost Efficiency Optimization
- **Success rate tracking:** Monitor first-pass vs regeneration ratios
- **Quality vs cost analysis:** Abort low-quality expensive batches
- **Trend projection:** Predict final costs based on batch performance

---

## Documentation & Tracking Protocols

### Generation Manifest (Master Document)
**Location:** `comic/_meta/generation-manifest-chapter1.md`

#### Per-Panel Documentation
```
Panel X.X:
- Generation attempts: X (first-pass/regeneration)
- Alice consistency: X/10 vs Panel 8.1 baseline
- Арни consistency: X/10 vs Panel 1.1+2.3 baseline  
- Quality rubric score: X/10 (weighted average)
- Specialist approvals: Фонарщик [PASS/FAIL] | Johnny [PASS/FAIL] | КиберГонзо [PASS/FAIL]
- Batch decision: [APPROVE/ITERATE/ESCALATE]
- Cost: $X.XX
- Notes: [any specific issues or recommendations]
```

#### Batch Summary Documentation
```
Batch X (Panels X-X):
- Total cost: $X.XX / $10.00 budget
- Average quality: X/10
- Success rate: X% first-pass
- Timeline: X hours
- Decision: [APPROVED/ITERATION_REQUIRED/ESCALATED]
- Next batch preparation: [READY/PENDING/BLOCKED]
```

### Quality Tracking Dashboard
**Location:** `comic/_meta/quality-dashboard-chapter1.md`

#### Real-Time Metrics
- Current chapter average quality score
- Budget expenditure vs allocation
- Success rate trends
- Quality degradation alerts
- Batch completion timeline

#### Trend Analysis
- Quality score progression across batches
- Character consistency drift detection
- Budget efficiency per batch
- Timeline adherence monitoring

---

## Risk Management Protocols

### Technical Risk Mitigation
**Content Safety:** КиберГонзо established E005 resolution pattern  
**Character Drift:** Фонарщик consistency protocol with measurable thresholds  
**Quality Degradation:** Johnny 5-dimension rubric with clear pass/fail  
**Budget Overrun:** Multi-tier monitoring with abort triggers

### Process Risk Management
**Team Coordination:** Simplified 3-specialist with clear authority  
**Approval Bottlenecks:** Single-gate process vs parallel expert delays  
**Timeline Pressure:** Realistic 2-hour batch windows with buffer  
**Context Overflow:** Proactive session management protocols

### Escalation Procedures
**Level 1:** Individual panel regeneration (2 attempt limit)  
**Level 2:** Batch iteration with enhanced prompts  
**Level 3:** Specialist consultation for systematic issues  
**Level 4:** Андрей escalation for budget/quality failures

---

## Implementation Readiness

### Prerequisites Verification
- [x] Constitutional verification complete (Alpha+Beta remediation)
- [x] Panel 9.1 content safety resolved (КиберГонзо pattern)
- [x] Character consistency sheets prepared (v1 baselines)
- [x] 3-Expert team activated (confirmed ready)
- [ ] Production pipeline setup complete ← **CURRENT**

### Pilot Batch Preparation
**Next Phase:** Pilot Batch (Panels 1-3) validation

#### Success Criteria
- 3 panels approved within quality standards
- Budget ≤$12 (including any iterations)
- Process completion under 2 hours
- Workflow validation for scaling

#### Validation Objectives
- Calibrate specialist review timing (30 min feasibility)
- Test convergence meeting effectiveness (15 min consensus)
- Verify batch documentation protocols
- Confirm quality threshold enforcement

### Production Scale Transition
Upon pilot batch success → full production execution (Batches 2-8)

---

**Production Pipeline v1 — Operational Framework Complete**  
*Author: Алиса | Date: 2026-04-28 | Authority: Level 3 Cartouche Autonome*  
*Ready for Pilot Batch Execution*