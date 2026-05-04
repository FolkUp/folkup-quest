# Constitutional Documentation Consistency Protocol

**Version:** 1.0 | **Date:** 2026-05-04 | **Authority:** Constitutional Framework Coordinator

## Mission Statement

**Mandate:** "проверяй консистентность и акутальность всей документации, включая ридми и docs.folup.app после каждого пуша"

*Translation: Check the consistency and currency of all documentation, including README and docs.folkup.app after every push*

## Constitutional Framework

This protocol implements **banking-level documentation standards** with real-time monitoring and constitutional compliance enforcement.

### Documentation Sources Under Constitutional Governance

| Source | Priority | Sync Targets | Validation Rules |
|--------|----------|--------------|------------------|
| **README.md** | P0 CRITICAL | docs.folkup.app, package.json, PROJECT.md | Version sync, feature parity, link integrity |
| **docs.folkup.app** | P0 CRITICAL | README.md, public docs, API docs | Content currency, cross-references, deployment sync |
| **PROJECT.md** | P1 HIGH | README.md, project context | Project status, dependency accuracy, workflow sync |
| **package.json** | P0 CRITICAL | README.md, dependency docs | Version consistency, script documentation, dependency sync |

## Usage

### Manual Execution

```bash
# Check documentation consistency
npm run docs:check

# Full post-push validation (includes optimization recommendations)
npm run docs:post-push

# Direct script execution
node scripts/constitutional-documentation-consistency.js
```

### Automated Integration

#### Git Hook Integration
```bash
# Add to .git/hooks/post-commit (optional)
#!/bin/bash
npm run docs:post-push
```

#### CI/CD Integration
```yaml
# GitHub Actions example
- name: Documentation Consistency Check
  run: npm run docs:check
```

## Constitutional Enforcement Levels

### ✅ COMPLIANT
- **Status:** OPERATIONAL
- **Action:** Monitor
- **Authority:** Continue operations
- **Description:** Documentation consistency maintained

### 📋 ADVISORY  
- **Status:** REVIEW_RECOMMENDED
- **Action:** Schedule update
- **Authority:** Expert review recommended
- **Description:** Minor inconsistencies detected, 24-hour resolution window

### ⚠️ WARNING
- **Status:** INCONSISTENCY_DETECTED
- **Action:** Immediate review
- **Authority:** Expert coordination required
- **Description:** Multiple documentation inconsistencies, immediate attention needed

### 🚨 CRITICAL
- **Status:** DOCUMENTATION_VIOLATION
- **Action:** Halt until resolved
- **Authority:** Constitutional override required
- **Description:** Serious documentation violations blocking operations

## Validation Framework

### Core Validations

1. **README.md Consistency Analysis**
   - Version alignment with package.json
   - Required section presence
   - Basic link integrity

2. **docs.folkup.app Currency Check**
   - Deployment script presence
   - Content synchronization status
   - Cross-reference validation

3. **Version Consistency Validation**
   - Cross-document version alignment
   - Version information presence
   - Consistency across all sources

4. **Link Integrity Verification**
   - Internal link validation
   - File reference accuracy
   - Cross-document link checking

### Constitutional Standards

- **Consistency Threshold:** 95% consistency required between sources
- **Update Window:** 24-hour currency requirement
- **Version Sync Tolerance:** Zero tolerance for version misalignment
- **Content Integrity:** Banking-level accuracy standards

## Output Reports

### Console Output
Real-time validation results with:
- Status indicators (✅ ⚠️ 🚨)
- Inconsistency counts
- Constitutional impact assessment
- Specific recommendations

### JSON Report
Detailed analysis saved to:
```
constitutional-documentation-consistency-report.json
```

Contains:
- Timestamp and authority information
- Detailed validation results
- Enforcement level determination
- Specific violations and recommendations

## Integration with Constitutional Framework

This protocol integrates with the broader **Constitutional Framework Coordinator** constitutional framework:

- **Expert Coordination:** Triggers appropriate specialist reviews
- **Banking-Level Standards:** Applies rigorous quality gates
- **Performance Monitoring:** Tracks documentation quality metrics
- **Constitutional Compliance:** Enforces consistency requirements

## Troubleshooting

### Common Issues

**Documentation Check Fails**
```bash
# Check script permissions
chmod +x scripts/post-push-doc-check.sh

# Verify Node.js availability
node --version

# Check file paths
ls -la scripts/constitutional-documentation-consistency.js
```

**Version Inconsistencies**
- Update package.json version
- Synchronize README.md version references  
- Verify PROJECT.md project status
- Check docs.folkup.app deployment sync

**Link Integrity Issues**
- Validate internal file references
- Check README.md link syntax
- Verify cross-document references
- Update broken or outdated links

### Exit Codes

| Code | Meaning | Action Required |
|------|---------|----------------|
| 0 | COMPLIANT | None - continue operations |
| 1 | CRITICAL | Manual intervention required |
| 2 | WARNING | Review recommended within 24h |
| 3 | ERROR | Check documentation system |

## Support and Escalation

For documentation consistency issues:

1. **ADVISORY/WARNING:** Address within 24-hour window
2. **CRITICAL:** Immediate resolution required
3. **System errors:** Check constitutional framework status
4. **Expert coordination:** Engage appropriate specialists

---

**Last Updated:** 2026-05-04 by Constitutional Framework Coordinator  
**Next Review:** Post-deployment validation and integration testing  
**Constitutional Status:** OPERATIONAL - Banking-level documentation standards active