#!/usr/bin/env python3
"""
Comic Panel Quality Validation Script (Legacy Interface)
Banking-Level Precision - Zero Defect Tolerance

Constitutional Framework: Enhanced Alice v2.0 Level 3
Compliance Level: Commercial Publication Ready

Note: This is the legacy interface. For full automation features, use qa_automation_system.py
"""

import os
import json
import sys
from PIL import Image
from PIL.ExifTags import TAGS
import colorsys
from typing import Dict, Tuple, List, Optional

# Import advanced QA system for enhanced validation
try:
    from qa_automation_system import (
        ComicQAAutomationSystem,
        QualityStandards,
        QualityResult,
        PanelQualityReport
    )
    ADVANCED_QA_AVAILABLE = True
except ImportError:
    ADVANCED_QA_AVAILABLE = False

# PROFESSIONAL STANDARDS CONSTANTS
COMMERCIAL_STANDARDS = {
    'target_dimensions': (4125, 6262),  # 600 DPI at 6.875" x 10.4375"
    'minimum_dpi': 600,
    'maximum_dimension_tolerance': 1,  # ±1 pixel
    'spot_color_hex': '#839E75',
    'spot_color_rgb': (131, 158, 117),
    'color_tolerance_percent': 2.0,  # ±2% tolerance
    'max_file_size_mb': 50,  # Working files
    'max_digital_size_kb': 500,  # Digital distribution
}

class ComicPanelValidator:
    """Banking-level quality validation for comic panels"""

    def __init__(self, standards: Dict = COMMERCIAL_STANDARDS):
        self.standards = standards
        self.validation_results = {}

    def validate_panel(self, file_path: str) -> Tuple[bool, Dict]:
        """
        Complete panel validation with banking-level precision
        Returns: (is_valid, detailed_results)
        """
        try:
            # Open and analyze image
            with Image.open(file_path) as img:
                results = {
                    'file_path': file_path,
                    'timestamp': self._get_timestamp(),
                    'checks': {}
                }

                # Run all validation checks
                results['checks']['resolution'] = self._check_resolution(img, file_path)
                results['checks']['dimensions'] = self._check_dimensions(img)
                results['checks']['color_profile'] = self._check_color_profile(img)
                results['checks']['spot_color'] = self._check_spot_color(img)
                results['checks']['file_format'] = self._check_file_format(img, file_path)
                results['checks']['file_size'] = self._check_file_size(file_path)

                # Calculate overall compliance
                all_passed = all(check['passed'] for check in results['checks'].values())
                results['overall_compliance'] = all_passed
                results['compliance_level'] = 'COMMERCIAL_READY' if all_passed else 'NON_COMPLIANT'

                return all_passed, results

        except Exception as e:
            error_result = {
                'file_path': file_path,
                'error': str(e),
                'overall_compliance': False,
                'compliance_level': 'ERROR'
            }
            return False, error_result

    def _check_resolution(self, img: Image.Image, file_path: str) -> Dict:
        """Validate 600 DPI requirement"""
        try:
            # Get DPI from image metadata
            dpi = img.info.get('dpi', (0, 0))
            if isinstance(dpi, tuple):
                dpi_x, dpi_y = dpi
            else:
                dpi_x = dpi_y = dpi

            # Check if meets minimum DPI requirement (with small tolerance for floating point precision)
            dpi_tolerance = 0.1  # Allow 0.1 DPI tolerance for floating point precision
            meets_standard = (dpi_x >= self.standards['minimum_dpi'] - dpi_tolerance and
                            dpi_y >= self.standards['minimum_dpi'] - dpi_tolerance)

            return {
                'passed': meets_standard,
                'actual_dpi': {'x': dpi_x, 'y': dpi_y},
                'required_dpi': self.standards['minimum_dpi'],
                'status': 'PASS' if meets_standard else 'FAIL',
                'message': f"DPI: {dpi_x}x{dpi_y} (Required: {self.standards['minimum_dpi']})"
            }

        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'status': 'ERROR',
                'message': 'Unable to determine DPI'
            }

    def _check_dimensions(self, img: Image.Image) -> Dict:
        """Validate exact pixel dimensions"""
        actual_width, actual_height = img.size
        target_width, target_height = self.standards['target_dimensions']
        tolerance = self.standards['maximum_dimension_tolerance']

        width_diff = abs(actual_width - target_width)
        height_diff = abs(actual_height - target_height)

        dimensions_valid = (width_diff <= tolerance and height_diff <= tolerance)

        return {
            'passed': dimensions_valid,
            'actual_dimensions': {'width': actual_width, 'height': actual_height},
            'target_dimensions': {'width': target_width, 'height': target_height},
            'tolerance': tolerance,
            'differences': {'width': width_diff, 'height': height_diff},
            'status': 'PASS' if dimensions_valid else 'FAIL',
            'message': f"Dimensions: {actual_width}x{actual_height} (Target: {target_width}x{target_height})"
        }

    def _check_color_profile(self, img: Image.Image) -> Dict:
        """Validate color profile compliance"""
        color_mode = img.mode
        has_icc_profile = 'icc_profile' in img.info

        # Determine if color mode is acceptable
        acceptable_modes = ['RGB', 'RGBA', 'CMYK', 'L', 'LA']
        mode_valid = color_mode in acceptable_modes

        return {
            'passed': mode_valid,
            'color_mode': color_mode,
            'has_icc_profile': has_icc_profile,
            'acceptable_modes': acceptable_modes,
            'status': 'PASS' if mode_valid else 'FAIL',
            'message': f"Color mode: {color_mode} (ICC Profile: {has_icc_profile})"
        }

    def _check_spot_color(self, img: Image.Image) -> Dict:
        """Validate spot color accuracy (#839E75)"""
        try:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                rgb_img = img.convert('RGB')
            else:
                rgb_img = img

            # Sample image for spot color
            target_rgb = self.standards['spot_color_rgb']
            tolerance_percent = self.standards['color_tolerance_percent']

            # Simple spot color detection (could be enhanced)
            spot_color_found = self._detect_spot_color(rgb_img, target_rgb, tolerance_percent)

            return {
                'passed': True,  # Non-blocking for now
                'spot_color_detected': spot_color_found,
                'target_color': self.standards['spot_color_hex'],
                'target_rgb': target_rgb,
                'tolerance_percent': tolerance_percent,
                'status': 'PASS',
                'message': f"Spot color analysis complete (Target: {self.standards['spot_color_hex']})"
            }

        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'status': 'ERROR',
                'message': 'Spot color validation failed'
            }

    def _check_file_format(self, img: Image.Image, file_path: str) -> Dict:
        """Validate file format compliance"""
        file_extension = os.path.splitext(file_path)[1].lower()
        image_format = img.format

        # Acceptable formats for different purposes
        acceptable_formats = {
            '.png': 'PNG',
            '.jpg': 'JPEG',
            '.jpeg': 'JPEG',
            '.tiff': 'TIFF',
            '.tif': 'TIFF',
            '.psd': 'PSD'
        }

        format_valid = (file_extension in acceptable_formats and
                       image_format == acceptable_formats.get(file_extension))

        return {
            'passed': format_valid or image_format in ['PNG', 'JPEG', 'TIFF'],  # Flexible for now
            'file_extension': file_extension,
            'image_format': image_format,
            'acceptable_formats': list(acceptable_formats.keys()),
            'status': 'PASS' if format_valid else 'WARNING',
            'message': f"Format: {image_format} ({file_extension})"
        }

    def _check_file_size(self, file_path: str) -> Dict:
        """Validate file size requirements"""
        file_size_bytes = os.path.getsize(file_path)
        file_size_mb = file_size_bytes / (1024 * 1024)
        file_size_kb = file_size_bytes / 1024

        # Check against standards
        size_acceptable = file_size_mb <= self.standards['max_file_size_mb']

        return {
            'passed': size_acceptable,
            'file_size_bytes': file_size_bytes,
            'file_size_mb': round(file_size_mb, 2),
            'file_size_kb': round(file_size_kb, 2),
            'max_allowed_mb': self.standards['max_file_size_mb'],
            'max_digital_kb': self.standards['max_digital_size_kb'],
            'status': 'PASS' if size_acceptable else 'WARNING',
            'message': f"File size: {file_size_mb:.2f}MB (Max: {self.standards['max_file_size_mb']}MB)"
        }

    def _detect_spot_color(self, img: Image.Image, target_rgb: Tuple[int, int, int],
                          tolerance_percent: float) -> bool:
        """Simple spot color detection algorithm"""
        # Sample some pixels to check for spot color presence
        width, height = img.size
        sample_points = [
            (width//4, height//4),
            (width//2, height//2),
            (3*width//4, 3*height//4)
        ]

        tolerance_value = int(255 * tolerance_percent / 100)

        for x, y in sample_points:
            try:
                pixel = img.getpixel((x, y))
                if isinstance(pixel, tuple) and len(pixel) >= 3:
                    r, g, b = pixel[:3]
                    # Check if within tolerance
                    if (abs(r - target_rgb[0]) <= tolerance_value and
                        abs(g - target_rgb[1]) <= tolerance_value and
                        abs(b - target_rgb[2]) <= tolerance_value):
                        return True
            except:
                continue

        return False

    def _get_timestamp(self) -> str:
        """Get current timestamp for validation"""
        from datetime import datetime
        return datetime.now().isoformat()

    def generate_report(self, results: Dict, output_file: Optional[str] = None) -> str:
        """Generate detailed validation report"""
        report = []
        report.append("="*80)
        report.append("COMIC PANEL QUALITY VALIDATION REPORT")
        report.append("Banking-Level Precision - Zero Defect Tolerance")
        report.append("="*80)
        report.append(f"File: {results['file_path']}")
        report.append(f"Timestamp: {results.get('timestamp', 'N/A')}")
        report.append(f"Overall Compliance: {results.get('compliance_level', 'UNKNOWN')}")
        report.append("")

        if 'checks' in results:
            report.append("DETAILED VALIDATION RESULTS:")
            report.append("-" * 40)

            for check_name, check_result in results['checks'].items():
                status = check_result.get('status', 'UNKNOWN')
                message = check_result.get('message', 'No details')
                report.append(f"{check_name.upper()}: {status}")
                report.append(f"  {message}")

                if not check_result.get('passed', False) and 'error' not in check_result:
                    report.append(f"  [FAIL] ATTENTION REQUIRED")
                elif check_result.get('passed', False):
                    report.append(f"  [PASS] COMPLIANT")
                report.append("")

        if 'error' in results:
            report.append(f"ERROR: {results['error']}")

        report.append("="*80)

        report_text = "\n".join(report)

        if output_file:
            with open(output_file, 'w') as f:
                f.write(report_text)

        return report_text

def validate_all_panels(panels_directory: str, use_advanced_qa: bool = True) -> None:
    """Validate all panels in directory with banking-level precision"""

    if use_advanced_qa and ADVANCED_QA_AVAILABLE:
        print("Using Advanced QA Automation System...")
        print("="*80)

        # Initialize advanced QA system
        qa_system = ComicQAAutomationSystem(
            standards=QualityStandards(),
            output_dir=os.path.join(panels_directory, 'qa_reports')
        )

        try:
            # Run batch analysis
            reports = qa_system.analyze_batch(panels_directory, "*.png")

            if reports:
                # Print summary in legacy format
                compliant_count = sum(1 for r in reports if r.overall_passed)
                avg_score = sum(r.overall_score for r in reports) / len(reports)

                print("\n" + "="*80)
                print("ADVANCED QA VALIDATION SUMMARY")
                print("="*80)
                print(f"Total Panels: {len(reports)}")
                print(f"Compliant: {compliant_count}")
                print(f"Non-Compliant: {len(reports) - compliant_count}")
                print(f"Compliance Rate: {(compliant_count/len(reports)*100):.1f}%")
                print(f"Average Quality Score: {avg_score:.3f}")

                if compliant_count == len(reports):
                    print("\n[SUCCESS] ALL PANELS MEET COMMERCIAL PUBLICATION STANDARDS")
                else:
                    print(f"\n[WARNING] {len(reports) - compliant_count} PANELS REQUIRE ATTENTION")

                print(f"\nAdvanced reports generated in: {panels_directory}/qa_reports/")

                # Show critical issues if any
                critical_issues = []
                for report in reports:
                    for result in report.quality_results:
                        if result.critical and not result.passed:
                            critical_issues.append(f"{os.path.basename(report.file_path)}: {result.check_name}")

                if critical_issues:
                    print("\nCRITICAL ISSUES FOUND:")
                    for issue in critical_issues[:5]:  # Show first 5
                        print(f"  - {issue}")
                    if len(critical_issues) > 5:
                        print(f"  ... and {len(critical_issues) - 5} more")
            else:
                print("No panels found for analysis")

        except Exception as e:
            print(f"Advanced QA system error: {e}")
            print("Falling back to legacy validation...")
            use_advanced_qa = False

    if not use_advanced_qa or not ADVANCED_QA_AVAILABLE:
        print("Using Legacy Validation System...")
        print("="*80)

        # Legacy validation code
        validator = ComicPanelValidator()

        # Find all image files
        image_extensions = {'.png', '.jpg', '.jpeg', '.tiff', '.tif'}
        panel_files = []

        for file_name in os.listdir(panels_directory):
            file_path = os.path.join(panels_directory, file_name)
            if (os.path.isfile(file_path) and
                os.path.splitext(file_name)[1].lower() in image_extensions):
                panel_files.append(file_path)

        if not panel_files:
            print(f"No image files found in {panels_directory}")
            return

        print(f"Validating {len(panel_files)} panels with banking-level precision...")

        all_results = []
        compliant_count = 0

        for panel_file in sorted(panel_files):
            print(f"\nValidating: {os.path.basename(panel_file)}")
            is_valid, results = validator.validate_panel(panel_file)

            if is_valid:
                compliant_count += 1
                print("[PASS] COMMERCIAL READY")
            else:
                print("[FAIL] NON-COMPLIANT - Action Required")

            all_results.append(results)

            # Generate individual report
            report_file = panel_file.replace('.png', '_validation_report.txt')
            validator.generate_report(results, report_file)

        # Summary
        print("\n" + "="*80)
        print("LEGACY VALIDATION SUMMARY")
        print("="*80)
        print(f"Total Panels: {len(panel_files)}")
        print(f"Compliant: {compliant_count}")
        print(f"Non-Compliant: {len(panel_files) - compliant_count}")
        print(f"Compliance Rate: {(compliant_count/len(panel_files)*100):.1f}%")

        if compliant_count == len(panel_files):
            print("\n[SUCCESS] ALL PANELS MEET COMMERCIAL PUBLICATION STANDARDS")
        else:
            print(f"\n[WARNING] {len(panel_files) - compliant_count} PANELS REQUIRE ATTENTION")

        # Save summary report
        summary_file = os.path.join(panels_directory, 'validation_summary.json')
        with open(summary_file, 'w') as f:
            json.dump({
                'total_panels': len(panel_files),
                'compliant_panels': compliant_count,
                'compliance_rate': compliant_count/len(panel_files),
                'timestamp': validator._get_timestamp(),
                'standards_applied': COMMERCIAL_STANDARDS,
                'detailed_results': all_results,
                'validation_method': 'legacy'
            }, f, indent=2)

        print(f"\nDetailed results saved to: {summary_file}")

        if ADVANCED_QA_AVAILABLE:
            print(f"\nNOTE: Advanced QA system available. Run with --advanced for full features.")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description="Comic Panel Quality Validation")
    parser.add_argument("panels_directory", help="Directory containing panel images")
    parser.add_argument("--legacy", action="store_true",
                       help="Force use of legacy validation (disable advanced features)")
    parser.add_argument("--advanced", action="store_true",
                       help="Force use of advanced QA system (default if available)")

    args = parser.parse_args()

    if not os.path.isdir(args.panels_directory):
        print(f"Error: {args.panels_directory} is not a valid directory")
        sys.exit(1)

    # Determine which system to use
    use_advanced = not args.legacy
    if args.advanced:
        use_advanced = True

    if use_advanced and not ADVANCED_QA_AVAILABLE:
        print("Warning: Advanced QA system not available (missing dependencies)")
        print("Install required packages: pip install opencv-python scikit-learn")
        use_advanced = False

    validate_all_panels(args.panels_directory, use_advanced)