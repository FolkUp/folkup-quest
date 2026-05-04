#!/bin/bash

# Post-Push Documentation Consistency Check
# Constitutional Framework Integration
# Enhanced Alice v2.0 Level 3 Cartouche Autonome

echo "🏛️ Constitutional Documentation Consistency Check"
echo "=============================================="
echo "📅 $(date)"
echo "🎯 Post-push validation mandate active"
echo ""

# Run the constitutional documentation consistency validation
node ./scripts/constitutional-documentation-consistency.js

# Capture exit code
DOC_CHECK_EXIT=$?

echo ""
echo "📊 Documentation Check Result:"

if [ $DOC_CHECK_EXIT -eq 0 ]; then
    echo "✅ COMPLIANT: Documentation consistency maintained"
    echo "🔄 No action required"
elif [ $DOC_CHECK_EXIT -eq 2 ]; then
    echo "⚠️ WARNING: Documentation inconsistencies detected"
    echo "📋 Review recommended within 24 hours"
    echo "💡 Run: npm run docs:fix (if available)"
elif [ $DOC_CHECK_EXIT -eq 1 ]; then
    echo "🚨 CRITICAL: Documentation violations require immediate attention"
    echo "🛑 Manual intervention required before next push"
    echo "📞 Consider escalating to documentation team"
else
    echo "🔥 ERROR: Documentation check system malfunction"
    echo "🔧 Check documentation consistency script status"
fi

echo ""
echo "🏛️ Constitutional Documentation Protocol Complete"
echo "=============================================="

# Return the original exit code for potential CI/CD integration
exit $DOC_CHECK_EXIT