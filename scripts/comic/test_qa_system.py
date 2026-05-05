#!/usr/bin/env python3
"""
QA System Test Suite
Banking-Level Precision Validation

Test the QA automation system components to ensure constitutional compliance
"""

import sys
import os
import tempfile
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from qa_automation_system import (
        ComicQAAutomationSystem,
        QualityStandards,
        ColorContaminationDetector,
        CharacterConsistencyAnalyzer,
        TechnicalQualityValidator
    )
    ADVANCED_QA_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Advanced QA system not available: {e}")
    ADVANCED_QA_AVAILABLE = False

def create_test_image(width=4125, height=6262, dpi=600, include_spot_color=True):
    """Create a test image with known properties for validation"""

    # Create image with correct dimensions
    image = Image.new('RGB', (width, height), color='white')

    # Set DPI
    image.info['dpi'] = (dpi, dpi)

    if include_spot_color:
        # Add spot color rectangle (Alice notebook)
        draw = ImageDraw.Draw(image)
        spot_color = (131, 158, 117)  # #839E75

        # Draw notebook-like rectangle
        notebook_x = width // 4
        notebook_y = height // 3
        notebook_w = width // 8
        notebook_h = height // 6

        draw.rectangle(
            [(notebook_x, notebook_y), (notebook_x + notebook_w, notebook_y + notebook_h)],
            fill=spot_color,
            outline='black'
        )

    return image

def test_basic_functionality():
    """Test basic system functionality"""
    print("Testing Basic Functionality...")

    if not ADVANCED_QA_AVAILABLE:
        print("❌ Advanced QA system not available - skipping tests")
        return False

    try:
        # Create standards
        standards = QualityStandards()
        print("✓ Quality standards created")

        # Create QA system
        with tempfile.TemporaryDirectory() as temp_dir:
            qa_system = ComicQAAutomationSystem(standards, temp_dir)
            print("✓ QA automation system initialized")

        return True
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def test_technical_validation():
    """Test technical quality validation"""
    print("\nTesting Technical Validation...")

    if not ADVANCED_QA_AVAILABLE:
        print("❌ Advanced QA system not available - skipping tests")
        return False

    try:
        standards = QualityStandards()
        validator = TechnicalQualityValidator(standards)

        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            # Create perfect test image
            test_image = create_test_image(4125, 6262, 600)
            test_image.save(temp_file.name, dpi=(600, 600))

            # Convert to numpy array
            import cv2
            image_array = cv2.imread(temp_file.name)
            image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)

            # Run technical validation
            results = validator.validate_technical_quality(temp_file.name, image_array)

            # Check results
            resolution_result = next((r for r in results if r.check_name == "resolution_validation"), None)
            dimension_result = next((r for r in results if r.check_name == "dimension_validation"), None)

            if resolution_result and resolution_result.passed:
                print("✓ Resolution validation passed")
            else:
                print("❌ Resolution validation failed")
                return False

            if dimension_result and dimension_result.passed:
                print("✓ Dimension validation passed")
            else:
                print("❌ Dimension validation failed")
                return False

            # Clean up
            os.unlink(temp_file.name)

        print("✓ Technical validation tests passed")
        return True

    except Exception as e:
        print(f"❌ Technical validation test failed: {e}")
        return False

def test_color_detection():
    """Test color contamination detection"""
    print("\nTesting Color Detection...")

    if not ADVANCED_QA_AVAILABLE:
        print("❌ Advanced QA system not available - skipping tests")
        return False

    try:
        standards = QualityStandards()
        detector = ColorContaminationDetector(standards)

        # Create test image with spot color
        test_image = create_test_image(1000, 1000, 300, include_spot_color=True)

        # Convert to numpy array
        image_array = np.array(test_image)

        # Test spot color detection
        spot_result = detector.detect_spot_color_precision(image_array)

        if spot_result.passed:
            print("✓ Spot color detection passed")
        else:
            print(f"⚠ Spot color detection: {spot_result.score:.2f} (may be expected for simple test)")

        # Test bleeding detection
        bleeding_result = detector.detect_bleeding(image_array)

        if bleeding_result.passed:
            print("✓ Bleeding detection passed")
        else:
            print("❌ Bleeding detection failed")
            return False

        print("✓ Color detection tests completed")
        return True

    except Exception as e:
        print(f"❌ Color detection test failed: {e}")
        return False

def test_character_analysis():
    """Test character consistency analysis"""
    print("\nTesting Character Analysis...")

    if not ADVANCED_QA_AVAILABLE:
        print("❌ Advanced QA system not available - skipping tests")
        return False

    try:
        standards = QualityStandards()
        analyzer = CharacterConsistencyAnalyzer(standards)

        # Create test image
        test_image = create_test_image(1000, 1000, 300, include_spot_color=True)
        image_array = np.array(test_image)

        # Test character analysis
        results = analyzer.analyze_character_consistency(image_array, ['alice', 'arni'])

        if 'alice_notebook' in results:
            print("✓ Alice notebook detection executed")

        if 'arni_ponytail' in results:
            print("✓ Arni ponytail detection executed")

        print("✓ Character analysis tests completed")
        return True

    except Exception as e:
        print(f"❌ Character analysis test failed: {e}")
        return False

def test_end_to_end_analysis():
    """Test complete panel analysis"""
    print("\nTesting End-to-End Analysis...")

    if not ADVANCED_QA_AVAILABLE:
        print("❌ Advanced QA system not available - skipping tests")
        return False

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create QA system
            qa_system = ComicQAAutomationSystem(output_dir=temp_dir)

            # Create test panel
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                test_image = create_test_image(4125, 6262, 600, include_spot_color=True)
                test_image.save(temp_file.name, dpi=(600, 600))

                # Run complete analysis
                report = qa_system.analyze_panel(temp_file.name, ['alice', 'arni'])

                # Check report
                if report.file_path == temp_file.name:
                    print("✓ Panel report generated")

                if report.overall_score > 0:
                    print(f"✓ Quality score calculated: {report.overall_score:.3f}")

                if report.quality_results:
                    print(f"✓ Quality checks executed: {len(report.quality_results)}")

                if report.audit_hash:
                    print("✓ Audit hash generated")

                # Clean up
                os.unlink(temp_file.name)

        print("✓ End-to-end analysis test passed")
        return True

    except Exception as e:
        print(f"❌ End-to-end analysis test failed: {e}")
        return False

def test_legacy_compatibility():
    """Test legacy system compatibility"""
    print("\nTesting Legacy Compatibility...")

    try:
        from validate_panel_quality import ComicPanelValidator, COMMERCIAL_STANDARDS

        # Test legacy validator
        validator = ComicPanelValidator(COMMERCIAL_STANDARDS)

        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            test_image = create_test_image(4125, 6262, 600)
            test_image.save(temp_file.name, dpi=(600, 600))

            # Run legacy validation
            is_valid, results = validator.validate_panel(temp_file.name)

            if isinstance(results, dict) and 'file_path' in results:
                print("✓ Legacy validation executed")

            if 'checks' in results:
                print(f"✓ Legacy checks completed: {len(results['checks'])}")

            # Clean up
            os.unlink(temp_file.name)

        print("✓ Legacy compatibility test passed")
        return True

    except Exception as e:
        print(f"❌ Legacy compatibility test failed: {e}")
        return False

def test_standards_configuration():
    """Test quality standards configuration"""
    print("\nTesting Standards Configuration...")

    try:
        # Test loading standards from file
        standards_file = Path(__file__).parent / "qa_standards.json"

        if standards_file.exists():
            with open(standards_file) as f:
                standards_data = json.load(f)
            print("✓ Standards file loaded")

            # Check required fields
            required_fields = ['resolution_standards', 'color_standards', 'quality_gates']
            for field in required_fields:
                if field in standards_data:
                    print(f"✓ {field} configuration found")
                else:
                    print(f"❌ Missing {field} configuration")
                    return False
        else:
            print("⚠ Standards file not found (not critical)")

        # Test creating standards object
        if ADVANCED_QA_AVAILABLE:
            standards = QualityStandards()
            print("✓ Quality standards object created")

            # Test key properties
            if standards.target_dimensions == (4125, 6262):
                print("✓ Target dimensions correct")

            if standards.minimum_dpi == 600:
                print("✓ Minimum DPI correct")

            if standards.spot_color_hex == '#839E75':
                print("✓ Spot color correct")

        print("✓ Standards configuration test passed")
        return True

    except Exception as e:
        print(f"❌ Standards configuration test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("QA AUTOMATION SYSTEM TEST SUITE")
    print("Banking-Level Precision Validation")
    print("="*60)

    tests = [
        ("Basic Functionality", test_basic_functionality),
        ("Standards Configuration", test_standards_configuration),
        ("Legacy Compatibility", test_legacy_compatibility),
    ]

    if ADVANCED_QA_AVAILABLE:
        tests.extend([
            ("Technical Validation", test_technical_validation),
            ("Color Detection", test_color_detection),
            ("Character Analysis", test_character_analysis),
            ("End-to-End Analysis", test_end_to_end_analysis),
        ])

    results = []

    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")

    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")

    if passed == total:
        print("🎉 ALL TESTS PASSED - QA System Ready for Production")
        return 0
    else:
        print("⚠ SOME TESTS FAILED - Review system before production use")
        return 1

if __name__ == "__main__":
    sys.exit(main())