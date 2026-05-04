# User Rights Implementation Guide
## GDPR Articles 15-22 Technical Implementation

**Target:** Development Team  
**Context:** FQST-012 Analytics Implementation  
**Compliance Standard:** Banking-Level GDPR Requirements

---

## 1. Consent Management Implementation

### Required UI Components

#### Consent Banner (First Visit)
```html
<div id="consent-banner" class="gdpr-consent">
  <h3>Настройки конфиденциальности</h3>
  <p>FolkUp Quest использует аналитику для улучшения игрового опыта.</p>
  
  <div class="consent-options">
    <label>
      <input type="radio" name="analytics-level" value="essential" checked>
      <strong>Только необходимые</strong> - Основные функции игры
      <small>Правовое основание: законный интерес</small>
    </label>
    
    <label>
      <input type="radio" name="analytics-level" value="enhanced">
      <strong>С улучшениями</strong> - Расширенная аналитика
      <small>Правовое основание: ваше согласие</small>
    </label>
  </div>
  
  <div class="consent-actions">
    <button id="save-consent">Сохранить настройки</button>
    <a href="/legal/privacy.html">Подробнее о данных</a>
  </div>
</div>
```

#### Settings Panel (In-Game)
```html
<div id="privacy-settings" class="settings-panel">
  <h3>Настройки конфиденциальности</h3>
  
  <div class="setting-group">
    <h4>Аналитика и улучшения</h4>
    <label class="toggle">
      <input type="checkbox" id="enhanced-analytics">
      <span class="slider"></span>
      Расширенная аналитика
    </label>
    <small>Помогает улучшить игровой опыт. Можно отключить в любое время.</small>
  </div>
  
  <div class="setting-group">
    <h4>Управление данными</h4>
    <button id="export-data">Экспорт данных прогресса</button>
    <button id="clear-data" class="danger">Очистить все данные</button>
    <small>Очистка удалит весь прогресс и настройки.</small>
  </div>
  
  <div class="setting-group">
    <a href="/legal/privacy.html" target="_blank">Политика конфиденциальности</a>
    <a href="mailto:privacy@folkup.app">Связаться по вопросам данных</a>
  </div>
</div>
```

---

## 2. Technical Implementation Requirements

### Consent Storage
```javascript
// localStorage key: 'folkup-privacy-consent'
const consentStructure = {
  version: '1.0',
  timestamp: '2026-05-03T10:30:00Z',
  enhanced_analytics: true, // boolean
  consent_method: 'explicit_banner', // or 'settings_panel'
  expires: '2027-05-03T10:30:00Z', // 12 months
  ip_hash: null, // Never store actual IP
  user_agent_hash: 'sha256_hash' // For validation only
};
```

### Analytics Control
```javascript
// src/utils/analytics.js modifications needed

export function updateConsentLevel(enhancedAnalytics) {
  const consent = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    enhanced_analytics: enhancedAnalytics,
    consent_method: 'settings_panel',
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  localStorage.setItem('folkup-privacy-consent', JSON.stringify(consent));
  
  // Update analytics state
  updateAnalyticsPermissions();
}

function updateAnalyticsPermissions() {
  const consent = getConsentRecord();
  if (!consent || isConsentExpired(consent)) {
    // Show consent banner
    showConsentBanner();
    return;
  }
  
  // Configure analytics based on consent
  enableEssentialAnalytics(); // Always enabled (legitimate interest)
  
  if (consent.enhanced_analytics) {
    enableEnhancedAnalytics();
  }
}
```

---

## 3. Data Subject Rights Implementation

### Right to Access (Article 15)
```javascript
export function generateDataExport() {
  const data = {
    export_date: new Date().toISOString(),
    privacy_policy_url: '/legal/privacy.html',
    contact_email: 'privacy@folkup.app',
    
    game_progress: {
      current_scene: localStorage.getItem('current_scene'),
      folk_counter: localStorage.getItem('folk_counter'),
      choices_made: JSON.parse(localStorage.getItem('choices_made') || '[]'),
      endings_reached: JSON.parse(localStorage.getItem('endings_reached') || '[]')
    },
    
    analytics_consent: JSON.parse(localStorage.getItem('folkup-privacy-consent') || '{}'),
    
    technical_info: {
      browser_storage_size: calculateStorageSize(),
      last_session: localStorage.getItem('last_session'),
      settings: JSON.parse(localStorage.getItem('game_settings') || '{}')
    },
    
    rights_info: {
      rectification: 'Contact privacy@folkup.app',
      erasure: 'Use "Очистить все данные" button or contact us',
      restriction: 'Disable analytics in settings',
      objection: 'Contact privacy@folkup.app with grounds',
      portability: 'This export file',
      withdraw_consent: 'Use privacy settings toggle'
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `folkup-quest-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Right to Erasure (Article 17)
```javascript
export function exerciseRightToErasure() {
  if (!confirm('Это удалит все данные прогресса и настройки. Продолжить?')) {
    return;
  }
  
  // Clear all localStorage data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('folkup-') || key.includes('game-') || key === 'current_scene') {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear any session data
  sessionStorage.clear();
  
  // Log erasure event (for legal compliance)
  console.log('[GDPR] User exercised right to erasure at', new Date().toISOString());
  
  // Redirect to start page
  window.location.href = '/';
}
```

### Consent Withdrawal (Article 7.3)
```javascript
export function withdrawConsent() {
  const consent = getConsentRecord();
  if (!consent || !consent.enhanced_analytics) {
    return; // Nothing to withdraw
  }
  
  // Update consent record
  const updatedConsent = {
    ...consent,
    enhanced_analytics: false,
    withdrawal_date: new Date().toISOString(),
    withdrawal_method: 'settings_panel'
  };
  
  localStorage.setItem('folkup-privacy-consent', JSON.stringify(updatedConsent));
  
  // Immediately stop enhanced analytics
  disableEnhancedAnalytics();
  
  // Show confirmation
  showNotification('Согласие отозвано. Расширенная аналитика отключена.');
}
```

---

## 4. Automated Compliance Checks

### Consent Expiry Monitoring
```javascript
export function checkConsentExpiry() {
  const consent = getConsentRecord();
  if (!consent) return;
  
  const expiryDate = new Date(consent.expires);
  const now = new Date();
  
  if (now >= expiryDate) {
    // Consent expired - revert to essential only
    disableEnhancedAnalytics();
    showConsentRenewalBanner();
  }
  
  // Check if expiring soon (30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (expiryDate <= thirtyDaysFromNow) {
    showConsentExpiryWarning();
  }
}
```

### Data Retention Enforcement
```javascript
export function enforceDataRetention() {
  const retentionPolicies = {
    session_data: 6 * 60 * 60 * 1000, // 6 hours in ms
    analytics_buffer: 6 * 60 * 60 * 1000, // 6 hours
    consent_records: 3 * 365 * 24 * 60 * 60 * 1000 // 3 years
  };
  
  // Clear expired session data
  const sessionStart = sessionStorage.getItem('session_start');
  if (sessionStart) {
    const sessionAge = Date.now() - parseInt(sessionStart);
    if (sessionAge > retentionPolicies.session_data) {
      sessionStorage.clear();
    }
  }
  
  // Clear old analytics data
  const analyticsData = JSON.parse(localStorage.getItem('analytics_buffer') || '[]');
  const currentTime = Date.now();
  const cleanedData = analyticsData.filter(event => {
    return (currentTime - event.timestamp) < retentionPolicies.analytics_buffer;
  });
  localStorage.setItem('analytics_buffer', JSON.stringify(cleanedData));
}
```

---

## 5. Legal Compliance Helpers

### Breach Detection
```javascript
export function detectPotentialBreach() {
  const issues = [];
  
  // Check for unexpected data persistence
  const storageSize = calculateStorageSize();
  if (storageSize > 1024 * 1024) { // 1MB threshold
    issues.push('Excessive localStorage usage detected');
  }
  
  // Check consent validity
  const consent = getConsentRecord();
  if (consent && !consent.version) {
    issues.push('Invalid consent record structure');
  }
  
  // Check for external data leakage
  if (window.performance.getEntriesByType('navigation').length > 1) {
    issues.push('Potential cross-session data leakage');
  }
  
  if (issues.length > 0) {
    console.error('[GDPR BREACH ALERT]', issues);
    // In production, this should notify the DPO
    // sendBreachNotification(issues);
  }
  
  return issues;
}
```

### Legal Logging
```javascript
export function logGDPREvent(eventType, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event_type: eventType, // 'consent_given', 'consent_withdrawn', 'data_exported', etc.
    details: details,
    session_id: getSessionId(), // Temporary session identifier only
    legal_basis: determineLegalBasis(eventType)
  };
  
  // Store in temporary buffer for compliance reporting
  const complianceLog = JSON.parse(sessionStorage.getItem('gdpr_compliance_log') || '[]');
  complianceLog.push(logEntry);
  
  // Keep only last 10 entries to avoid storage bloat
  if (complianceLog.length > 10) {
    complianceLog.shift();
  }
  
  sessionStorage.setItem('gdpr_compliance_log', JSON.stringify(complianceLog));
}
```

---

## 6. Testing Requirements

### Automated Tests Needed
1. **Consent flow testing** - All user paths through consent mechanism
2. **Data retention testing** - Automatic cleanup verification
3. **Rights exercise testing** - Each GDPR right implementation
4. **Breach detection testing** - Security monitoring functions
5. **Cross-browser testing** - localStorage behavior consistency

### Manual Testing Checklist
- [ ] Consent banner appears on first visit
- [ ] Settings panel accessible from game menu
- [ ] Data export generates complete JSON
- [ ] Data erasure removes all traces
- [ ] Consent withdrawal immediate takes effect
- [ ] Expired consent handled gracefully
- [ ] Privacy policy links functional
- [ ] Contact mechanisms working

---

**Implementation Priority:** BLOCKING for FQST-012 deployment  
**Legal Review Required:** Before production release  
**Security Clearance:** Cooper approval maintained throughout implementation

**Development Team Contact:** Technical implementation questions to development lead  
**Legal Questions:** privacy@folkup.app or Alice Legal Compliance System