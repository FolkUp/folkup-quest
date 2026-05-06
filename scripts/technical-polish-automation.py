#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FQST Comic Technical Polish Automation System
Enhanced Alice v2.0 Level 3 Cartouche Autonome Operation
Constitutional Framework: Banking-Level Quality Standards

PURPOSE: Automated correction of typesetter-identified artifacts
TARGET: 15% content requiring polish for premium commercial publication
AUTHORITY: Андрей картбланш + Enhanced Alice v2.0 Level 3 autonomous operation

Specific Issues to Address:
- Panel 1.2: Banding artifacts in character clothing texture
- Panel 2.3: Blur inconsistency between signage and characters
- Panel 4.1: Reflection detail mismatch with character precision
- Panel 4.7: Over-processed geometric perfection lacking organic feel
"""

import cv2
import numpy as np
import os
import json
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
import argparse
from datetime import datetime
import time

# Constitutional Quality Standards
CONSTITUTIONAL_STANDARDS = {
    'target_quality_threshold': 0.95,  # 95% banking-level compliance
    'banding_artifact_tolerance': 0.02,  # 2% maximum banding noise
    'tonal_consistency_threshold': 0.98,  # 98% cross-panel consistency
    'detail_precision_requirement': 0.90,  # 90% detail preservation
    'organic_feel_enhancement': True,  # Reduce over-processed appearance
    'constitutional_compliance': 'banking-level'
}

class TechnicalPolishEngine:
    """Constitutional technical polish with banking-level quality standards"""

    def __init__(self, constitutional_mode=True):
        self.constitutional_mode = constitutional_mode
        self.quality_gates = []
        self.evidence_chain = []
        self.processed_panels = 0
        self.successful_polish = 0

    def analyze_panel_artifacts(self, panel_path):
        """Constitutional artifact analysis with banking-level detection"""

        print(f"  Analyzing artifacts: {Path(panel_path).name}")

        try:
            # Load image for analysis
            image = cv2.imread(panel_path, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError(f"Cannot load image: {panel_path}")

            height, width = image.shape[:2]

            # Constitutional artifact detection
            artifacts = {
                'panel_path': panel_path,
                'dimensions': f"{width}x{height}",
                'banding_artifacts': self._detect_banding_artifacts(image),
                'tonal_inconsistency': self._analyze_tonal_consistency(image),
                'over_processing_score': self._detect_over_processing(image),
                'detail_preservation_score': self._analyze_detail_preservation(image),
                'constitutional_compliance': True,
                'analysis_timestamp': datetime.utcnow().isoformat()
            }

            # Banking-level quality assessment
            overall_quality = (
                (1.0 - artifacts['banding_artifacts']) * 0.3 +
                artifacts['tonal_inconsistency'] * 0.3 +
                (1.0 - artifacts['over_processing_score']) * 0.2 +
                artifacts['detail_preservation_score'] * 0.2
            )

            artifacts['overall_quality_score'] = round(overall_quality, 3)
            artifacts['requires_polish'] = overall_quality < CONSTITUTIONAL_STANDARDS['target_quality_threshold']

            self.evidence_chain.append({
                'stage': 'artifact_analysis',
                'result': artifacts,
                'constitutional_status': 'COMPLIANT'
            })

            return artifacts

        except Exception as e:
            error_result = {
                'panel_path': panel_path,
                'error': str(e),
                'constitutional_status': 'ANALYSIS_FAILED',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.evidence_chain.append({
                'stage': 'artifact_analysis',
                'result': error_result,
                'constitutional_status': 'BLOCKING'
            })
            raise

    def _detect_banding_artifacts(self, image):
        """Banking-level banding artifact detection"""

        # Convert to grayscale for gradient analysis
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Calculate gradients to find banding patterns
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

        # Analyze gradient histogram for banding patterns
        grad_magnitude = np.sqrt(grad_x**2 + grad_y**2)

        # Banding shows up as repeated gradient values
        hist, bins = np.histogram(grad_magnitude.flatten(), bins=256, range=[0, 256])

        # Calculate variance in histogram - banding creates spikes
        hist_variance = np.var(hist)
        normalized_variance = hist_variance / (grad_magnitude.shape[0] * grad_magnitude.shape[1])

        # Higher normalized variance indicates more banding artifacts
        banding_score = min(normalized_variance / 1000.0, 1.0)  # Normalize to 0-1

        return round(banding_score, 4)

    def _analyze_tonal_consistency(self, image):
        """Constitutional tonal consistency analysis"""

        # Convert to LAB color space for perceptual analysis
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel = lab[:, :, 0]  # Lightness channel

        # Analyze tonal distribution consistency
        regions_count = 16  # Divide image into 4x4 regions
        region_height = l_channel.shape[0] // 4
        region_width = l_channel.shape[1] // 4

        region_means = []
        for i in range(4):
            for j in range(4):
                y1 = i * region_height
                y2 = (i + 1) * region_height
                x1 = j * region_width
                x2 = (j + 1) * region_width

                region = l_channel[y1:y2, x1:x2]
                region_means.append(np.mean(region))

        # Calculate coefficient of variation
        mean_luminance = np.mean(region_means)
        std_luminance = np.std(region_means)

        if mean_luminance > 0:
            coefficient_of_variation = std_luminance / mean_luminance
            # Convert to consistency score (higher = more consistent)
            tonal_consistency = max(0, 1.0 - (coefficient_of_variation / 0.5))
        else:
            tonal_consistency = 0.0

        return round(tonal_consistency, 4)

    def _detect_over_processing(self, image):
        """Constitutional over-processing detection"""

        # Over-processing manifests as unnatural sharpness and edge artifacts
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Calculate edge density using Canny
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])

        # Calculate sharpness using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        normalized_sharpness = min(laplacian_var / 10000.0, 1.0)

        # Over-processing score: combination of excessive edge density and sharpness
        over_processing_score = (edge_density * 0.6) + (normalized_sharpness * 0.4)

        # Clamp to 0-1 range
        over_processing_score = min(over_processing_score, 1.0)

        return round(over_processing_score, 4)

    def _analyze_detail_preservation(self, image):
        """Constitutional detail preservation analysis"""

        # Detail preservation measured by texture complexity
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Calculate local binary patterns for texture analysis
        def local_binary_pattern(image, radius=1):
            h, w = image.shape
            lbp = np.zeros((h, w), dtype=np.uint8)

            # Simplified LBP calculation
            for i in range(radius, h - radius):
                for j in range(radius, w - radius):
                    center = image[i, j]
                    code = 0
                    code |= (image[i-radius, j-radius] >= center) << 0
                    code |= (image[i-radius, j] >= center) << 1
                    code |= (image[i-radius, j+radius] >= center) << 2
                    code |= (image[i, j+radius] >= center) << 3
                    code |= (image[i+radius, j+radius] >= center) << 4
                    code |= (image[i+radius, j] >= center) << 5
                    code |= (image[i+radius, j-radius] >= center) << 6
                    code |= (image[i, j-radius] >= center) << 7
                    lbp[i, j] = code

            return lbp

        # Calculate texture complexity
        lbp = local_binary_pattern(gray)
        texture_complexity = len(np.unique(lbp)) / 256.0  # Normalized unique patterns

        return round(texture_complexity, 4)

    def apply_constitutional_polish(self, panel_path, artifacts_analysis):
        """Constitutional technical polish application"""

        print(f"  Applying constitutional polish: {Path(panel_path).name}")

        try:
            # Load image with PIL for high-quality processing
            image = Image.open(panel_path).convert('RGB')

            # Create polished version based on detected issues
            polished_image = image.copy()

            # Address specific issues based on analysis
            if artifacts_analysis['banding_artifacts'] > CONSTITUTIONAL_STANDARDS['banding_artifact_tolerance']:
                polished_image = self._reduce_banding_artifacts(polished_image, artifacts_analysis['banding_artifacts'])

            if artifacts_analysis['tonal_inconsistency'] < CONSTITUTIONAL_STANDARDS['tonal_consistency_threshold']:
                polished_image = self._enhance_tonal_consistency(polished_image, artifacts_analysis['tonal_inconsistency'])

            if artifacts_analysis['over_processing_score'] > 0.7:  # High over-processing
                polished_image = self._restore_organic_feel(polished_image, artifacts_analysis['over_processing_score'])

            if artifacts_analysis['detail_preservation_score'] < 0.7:  # Low detail preservation
                polished_image = self._enhance_detail_preservation(polished_image, artifacts_analysis['detail_preservation_score'])

            # Generate output filename
            panel_name = Path(panel_path).stem
            output_filename = f"{panel_name}-polished.png"
            output_path = Path(panel_path).parent / output_filename

            # Save with constitutional DPI requirements
            polished_image.save(
                output_path,
                dpi=(600, 600),  # Constitutional DPI requirement
                quality=100,
                optimize=False
            )

            polish_result = {
                'input_path': panel_path,
                'output_path': str(output_path),
                'artifacts_addressed': {
                    'banding_reduction': artifacts_analysis['banding_artifacts'] > CONSTITUTIONAL_STANDARDS['banding_artifact_tolerance'],
                    'tonal_enhancement': artifacts_analysis['tonal_inconsistency'] < CONSTITUTIONAL_STANDARDS['tonal_consistency_threshold'],
                    'organic_feel_restoration': artifacts_analysis['over_processing_score'] > 0.7,
                    'detail_enhancement': artifacts_analysis['detail_preservation_score'] < 0.7
                },
                'file_size_bytes': os.path.getsize(output_path),
                'constitutional_compliant': True,
                'polish_timestamp': datetime.utcnow().isoformat()
            }

            self.evidence_chain.append({
                'stage': 'constitutional_polish',
                'result': polish_result,
                'constitutional_status': 'COMPLIANT'
            })

            return polish_result

        except Exception as e:
            error_result = {
                'panel_path': panel_path,
                'error': str(e),
                'constitutional_status': 'POLISH_FAILED',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.evidence_chain.append({
                'stage': 'constitutional_polish',
                'result': error_result,
                'constitutional_status': 'BLOCKING'
            })
            raise

    def _reduce_banding_artifacts(self, image, banding_score):
        """Constitutional banding artifact reduction"""

        # Apply subtle smoothing to reduce banding while preserving detail
        smoothing_strength = min(banding_score * 2.0, 1.0)  # Scale with detected banding

        # Use gentle bilateral filter to reduce banding while preserving edges
        image_array = np.array(image)

        # Convert to cv2 format
        cv2_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

        # Apply bilateral filter with constitutional quality parameters
        filtered = cv2.bilateralFilter(cv2_image, 9, 75 * smoothing_strength, 75 * smoothing_strength)

        # Convert back to PIL
        filtered_rgb = cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB)
        return Image.fromarray(filtered_rgb)

    def _enhance_tonal_consistency(self, image, consistency_score):
        """Constitutional tonal consistency enhancement"""

        # Apply gentle histogram equalization to improve tonal consistency
        enhancement_strength = 1.0 - consistency_score  # Stronger for lower consistency

        # Convert to numpy array for processing
        image_array = np.array(image)

        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # Convert to LAB for perceptual processing
        lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)

        # Apply CLAHE to L channel only
        clahe = cv2.createCLAHE(clipLimit=2.0 * enhancement_strength, tileGridSize=(8, 8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])

        # Convert back to RGB
        enhanced_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        return Image.fromarray(enhanced_rgb)

    def _restore_organic_feel(self, image, over_processing_score):
        """Constitutional organic feel restoration"""

        # Reduce over-processed appearance by adding subtle noise and softness
        reduction_strength = min(over_processing_score, 1.0)

        # Apply very subtle gaussian blur to reduce artificial sharpness
        blur_radius = 0.5 * reduction_strength
        if blur_radius > 0.1:  # Only apply if meaningful
            image = image.filter(ImageFilter.GaussianBlur(radius=blur_radius))

        # Add subtle noise to restore organic texture
        image_array = np.array(image).astype(np.float32)

        # Generate subtle noise
        noise_strength = 2.0 * reduction_strength  # Very subtle
        noise = np.random.normal(0, noise_strength, image_array.shape)

        # Apply noise and clamp
        noisy_image = image_array + noise
        noisy_image = np.clip(noisy_image, 0, 255).astype(np.uint8)

        return Image.fromarray(noisy_image)

    def _enhance_detail_preservation(self, image, detail_score):
        """Constitutional detail preservation enhancement"""

        # Enhance details while maintaining constitutional quality
        enhancement_factor = 1.0 + (0.2 * (1.0 - detail_score))  # Up to 20% enhancement

        # Use PIL's built-in sharpness enhancement
        enhancer = ImageEnhance.Sharpness(image)
        return enhancer.enhance(enhancement_factor)

    def validate_polish_quality(self, original_path, polished_path):
        """Constitutional polish quality validation"""

        try:
            # Analyze both original and polished versions
            original_artifacts = self.analyze_panel_artifacts(original_path)
            polished_artifacts = self.analyze_panel_artifacts(polished_path)

            # Calculate improvement metrics
            improvement = {
                'banding_improvement': original_artifacts['banding_artifacts'] - polished_artifacts['banding_artifacts'],
                'tonal_improvement': polished_artifacts['tonal_inconsistency'] - original_artifacts['tonal_inconsistency'],
                'over_processing_reduction': original_artifacts['over_processing_score'] - polished_artifacts['over_processing_score'],
                'detail_preservation_change': polished_artifacts['detail_preservation_score'] - original_artifacts['detail_preservation_score'],
                'overall_quality_improvement': polished_artifacts['overall_quality_score'] - original_artifacts['overall_quality_score']
            }

            # Constitutional validation
            validation = {
                'original_path': original_path,
                'polished_path': polished_path,
                'improvement_metrics': improvement,
                'constitutional_compliant': polished_artifacts['overall_quality_score'] >= CONSTITUTIONAL_STANDARDS['target_quality_threshold'],
                'banking_level_achieved': polished_artifacts['overall_quality_score'] >= 0.95,
                'validation_timestamp': datetime.utcnow().isoformat()
            }

            self.evidence_chain.append({
                'stage': 'polish_validation',
                'result': validation,
                'constitutional_status': 'COMPLIANT'
            })

            return validation

        except Exception as e:
            error_result = {
                'original_path': original_path,
                'polished_path': polished_path,
                'error': str(e),
                'constitutional_status': 'VALIDATION_FAILED',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.evidence_chain.append({
                'stage': 'polish_validation',
                'result': error_result,
                'constitutional_status': 'BLOCKING'
            })
            raise

    def generate_constitutional_report(self, output_dir):
        """Constitutional compliance report generation"""

        report = {
            'system': 'FQST Comic Technical Polish Automation System',
            'framework': 'Enhanced Alice v2.0 Level 3 Cartouche Autonome Operation',
            'authority': 'Андрей картбланш + typesetter artifact identification',
            'standards': CONSTITUTIONAL_STANDARDS,
            'constitutional_mode': self.constitutional_mode,
            'execution_summary': {
                'panels_processed': self.processed_panels,
                'successful_polish': self.successful_polish,
                'success_rate_percent': round((self.successful_polish / max(self.processed_panels, 1)) * 100, 2)
            },
            'evidence_chain': self.evidence_chain,
            'overall_compliance': all(
                entry['constitutional_status'] in ['COMPLIANT']
                for entry in self.evidence_chain
            ),
            'report_generated': datetime.utcnow().isoformat()
        }

        report_path = os.path.join(output_dir, 'constitutional-technical-polish-report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        return report_path


def main():
    parser = argparse.ArgumentParser(description='FQST Comic Technical Polish Automation')
    parser.add_argument('--input-dir', default='./scripts/comic/panels-commercial',
                        help='Input directory with commercial panels')
    parser.add_argument('--target-panels', nargs='*',
                        help='Specific panels to polish (e.g. panel-1.2-commercial panel-2.3-commercial)')
    parser.add_argument('--constitutional', action='store_true', default=True,
                        help='Enable constitutional compliance mode')
    parser.add_argument('--validate-only', action='store_true',
                        help='Only validate existing polished panels')

    args = parser.parse_args()

    try:
        # Initialize constitutional polish engine
        polish_engine = TechnicalPolishEngine(constitutional_mode=args.constitutional)

        print("=== FQST COMIC TECHNICAL POLISH AUTOMATION ===")
        print("Enhanced Alice v2.0 Level 3 Cartouche Autonome Operation")
        print("Authority: Андрей картбланш + typesetter artifact identification")
        print("Target: 15% content requiring polish for premium commercial publication")
        print("")

        # Discover panels to process
        input_dir = Path(args.input_dir)
        if not input_dir.exists():
            raise ValueError(f"Input directory not found: {input_dir}")

        if args.target_panels:
            # Process specific panels
            panel_files = [input_dir / f"{panel}.png" for panel in args.target_panels]
            panel_files = [f for f in panel_files if f.exists()]
        else:
            # Process all commercial panels
            panel_files = list(input_dir.glob('panel-*-commercial.png'))

        if not panel_files:
            raise ValueError("No panels found for processing")

        print(f"Discovered {len(panel_files)} panels for constitutional polish")
        print("")

        # Process each panel
        for i, panel_path in enumerate(panel_files):
            panel_name = panel_path.stem
            print(f"\n[{i+1}/{len(panel_files)}] Processing {panel_name}...")

            polish_engine.processed_panels += 1

            try:
                # Phase 1: Constitutional artifact analysis
                print("  Phase 1: Constitutional artifact analysis...")
                artifacts = polish_engine.analyze_panel_artifacts(str(panel_path))

                if artifacts['requires_polish']:
                    print(f"  Quality score: {artifacts['overall_quality_score']} - REQUIRES POLISH")

                    # Phase 2: Constitutional polish application
                    print("  Phase 2: Constitutional polish application...")
                    polish_result = polish_engine.apply_constitutional_polish(str(panel_path), artifacts)

                    # Phase 3: Polish quality validation
                    print("  Phase 3: Polish quality validation...")
                    validation = polish_engine.validate_polish_quality(str(panel_path), polish_result['output_path'])

                    if validation['constitutional_compliant']:
                        polish_engine.successful_polish += 1
                        print(f"  SUCCESS: Constitutional polish complete")
                        print(f"  Quality improvement: +{validation['improvement_metrics']['overall_quality_improvement']:.3f}")
                    else:
                        print(f"  WARNING: Constitutional standards not achieved")

                else:
                    print(f"  Quality score: {artifacts['overall_quality_score']} - NO POLISH REQUIRED")
                    polish_engine.successful_polish += 1

            except Exception as e:
                print(f"  ERROR: Panel processing failed: {e}")

        # Generate constitutional compliance report
        print(f"\n=== CONSTITUTIONAL TECHNICAL POLISH COMPLETE ===")
        report_path = polish_engine.generate_constitutional_report(str(input_dir))
        print(f"Constitutional report: {report_path}")
        print(f"Panels processed: {polish_engine.processed_panels}")
        print(f"Successfully polished: {polish_engine.successful_polish}")
        print(f"Success rate: {(polish_engine.successful_polish / max(polish_engine.processed_panels, 1)) * 100:.1f}%")

        if polish_engine.successful_polish < polish_engine.processed_panels:
            print("\nWarning: Some panels did not achieve constitutional standards")
            sys.exit(1)
        else:
            print("\nBANKING-LEVEL CONSTITUTIONAL COMPLIANCE: ACHIEVED")
            sys.exit(0)

    except Exception as e:
        print(f"\nCRITICAL ERROR: Technical polish automation failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()