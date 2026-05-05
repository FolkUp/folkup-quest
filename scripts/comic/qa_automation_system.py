#!/usr/bin/env python3
"""
Comic Production QA Automation System
Banking-Level Precision - Zero Defect Tolerance

Constitutional Framework: Enhanced Alice v2.0 Level 3
Mission: Comprehensive automated quality assurance for comic production pipeline
Author: Johnny - QA Automation Architecture Specialist
"""

import os
import json
import sys
import cv2
import numpy as np
from PIL import Image, ImageStat
from pathlib import Path
from typing import Dict, Tuple, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib
import argparse
from collections import defaultdict
import logging

# Configure logging for banking-level audit trail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s',
    handlers=[
        logging.FileHandler('qa_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class QualityStandards:
    """Banking-level quality standards configuration"""
    # Resolution & Format Standards
    target_dimensions: Tuple[int, int] = (4125, 6262)  # 600 DPI at 6.875" x 10.4375"
    minimum_dpi: int = 600
    dimension_tolerance_pixels: int = 1  # ±1 pixel precision
    acceptable_formats: List[str] = None

    # Color Standards (КиберГонзо SURGICAL_COLOR_PROTOCOL)
    spot_color_hex: str = '#839E75'  # Alice notebook sage
    spot_color_rgb: Tuple[int, int, int] = (131, 158, 117)
    color_tolerance_percent: float = 1.0  # ±1% surgical precision
    bleeding_detection_threshold: float = 0.02  # 2% color bleeding tolerance

    # Character Consistency Standards
    character_recognition_threshold: float = 0.85  # 85% minimum recognition score
    ponytail_visibility_requirement: bool = True  # Арни ponytail mandate
    alice_notebook_requirement: bool = True  # Alice sage notebook mandate
    facial_consistency_threshold: float = 0.80  # 80% facial similarity

    # File Standards
    max_file_size_mb: float = 50.0  # Working files
    max_digital_size_kb: float = 500.0  # Digital distribution
    pdf_xa1_compliance: bool = True  # Print readiness

    # Quality Gate Thresholds
    overall_pass_threshold: float = 0.90  # 90% overall compliance required
    critical_failure_threshold: float = 0.70  # Below 70% = critical failure

    def __post_init__(self):
        if self.acceptable_formats is None:
            self.acceptable_formats = ['PNG', 'JPEG', 'TIFF', 'PSD']

@dataclass
class QualityResult:
    """Individual quality check result"""
    check_name: str
    passed: bool
    score: float
    confidence: float
    details: Dict[str, Any]
    critical: bool = False
    evidence: Optional[str] = None
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

@dataclass
class PanelQualityReport:
    """Complete panel quality assessment"""
    file_path: str
    overall_passed: bool
    overall_score: float
    compliance_level: str
    quality_results: List[QualityResult]
    character_consistency: Dict[str, float]
    color_analysis: Dict[str, Any]
    technical_metrics: Dict[str, Any]
    recommendations: List[str]
    evidence_files: List[str]
    timestamp: str = None
    audit_hash: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
        if self.audit_hash is None:
            self.audit_hash = self._generate_audit_hash()

    def _generate_audit_hash(self) -> str:
        """Generate audit hash for banking-level traceability"""
        content = f"{self.file_path}{self.timestamp}{self.overall_score}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

class ColorContaminationDetector:
    """Surgical precision color contamination detection system"""

    def __init__(self, standards: QualityStandards):
        self.standards = standards
        self.target_rgb = np.array(standards.spot_color_rgb)
        self.tolerance = int(255 * standards.color_tolerance_percent / 100)

    def detect_spot_color_precision(self, image: np.ndarray) -> QualityResult:
        """КиберГонзо SURGICAL_COLOR_PROTOCOL implementation"""
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image

            # Create color mask for spot color detection
            lower_bound = self.target_rgb - self.tolerance
            upper_bound = self.target_rgb + self.tolerance

            # Clip to valid range
            lower_bound = np.clip(lower_bound, 0, 255)
            upper_bound = np.clip(upper_bound, 0, 255)

            # Create mask
            mask = cv2.inRange(rgb_image, lower_bound, upper_bound)
            spot_color_pixels = np.sum(mask > 0)
            total_pixels = mask.shape[0] * mask.shape[1]
            spot_color_percentage = (spot_color_pixels / total_pixels) * 100

            # Analyze color distribution
            color_distribution = self._analyze_color_distribution(rgb_image)

            # Check for surgical precision compliance
            precision_score = self._calculate_color_precision(rgb_image, mask)

            return QualityResult(
                check_name="spot_color_precision",
                passed=precision_score >= 0.95,  # 95% precision required
                score=precision_score,
                confidence=0.95,
                details={
                    'spot_color_percentage': spot_color_percentage,
                    'precision_score': precision_score,
                    'color_distribution': color_distribution,
                    'target_rgb': self.target_rgb.tolist(),
                    'tolerance': self.tolerance,
                    'pixels_detected': int(spot_color_pixels)
                },
                critical=False
            )

        except Exception as e:
            logger.error(f"Color precision detection failed: {e}")
            return QualityResult(
                check_name="spot_color_precision",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

    def detect_bleeding(self, image: np.ndarray) -> QualityResult:
        """Real-time bleeding detection for Panel 8.1 type issues"""
        try:
            # Convert to LAB color space for better bleeding detection
            lab_image = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)

            # Apply Gaussian blur to detect color bleeding
            blurred = cv2.GaussianBlur(lab_image, (5, 5), 0)

            # Calculate difference between original and blurred
            diff = cv2.absdiff(lab_image, blurred)

            # Convert to grayscale for analysis
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_LAB2GRAY)

            # Calculate bleeding score
            bleeding_score = np.mean(gray_diff) / 255.0

            # Check against threshold
            bleeding_detected = bleeding_score > self.standards.bleeding_detection_threshold

            return QualityResult(
                check_name="color_bleeding_detection",
                passed=not bleeding_detected,
                score=1.0 - bleeding_score if not bleeding_detected else 0.0,
                confidence=0.90,
                details={
                    'bleeding_score': bleeding_score,
                    'threshold': self.standards.bleeding_detection_threshold,
                    'bleeding_detected': bleeding_detected,
                    'analysis_method': 'LAB_color_space_gaussian_blur'
                },
                critical=bleeding_detected
            )

        except Exception as e:
            logger.error(f"Bleeding detection failed: {e}")
            return QualityResult(
                check_name="color_bleeding_detection",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

    def _analyze_color_distribution(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze color distribution for quality insights"""
        # Calculate color histograms
        hist_r = cv2.calcHist([image], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([image], [1], None, [256], [0, 256])
        hist_b = cv2.calcHist([image], [2], None, [256], [0, 256])

        return {
            'dominant_colors': self._find_dominant_colors(image),
            'color_variance': {
                'red': float(np.var(hist_r)),
                'green': float(np.var(hist_g)),
                'blue': float(np.var(hist_b))
            },
            'brightness_mean': float(np.mean(cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)))
        }

    def _find_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[Tuple[int, int, int]]:
        """Find dominant colors using K-means clustering"""
        from sklearn.cluster import KMeans

        # Reshape image to be a list of pixels
        pixels = image.reshape(-1, 3)

        # Sample pixels for performance
        if len(pixels) > 10000:
            indices = np.random.choice(len(pixels), 10000, replace=False)
            pixels = pixels[indices]

        # Apply K-means
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(pixels)

        # Get dominant colors
        colors = kmeans.cluster_centers_.astype(int)
        return [tuple(color) for color in colors]

    def _calculate_color_precision(self, image: np.ndarray, mask: np.ndarray) -> float:
        """Calculate surgical color precision score"""
        if np.sum(mask) == 0:
            return 0.0

        # Extract pixels that match the spot color
        spot_pixels = image[mask > 0]

        if len(spot_pixels) == 0:
            return 0.0

        # Calculate precision as inverse of standard deviation from target
        deviations = np.sqrt(np.sum((spot_pixels - self.target_rgb) ** 2, axis=1))
        avg_deviation = np.mean(deviations)

        # Convert to precision score (0-1, where 1 is perfect precision)
        max_possible_deviation = np.sqrt(3 * (255 ** 2))  # Maximum possible RGB deviation
        precision = 1.0 - (avg_deviation / max_possible_deviation)

        return max(0.0, min(1.0, precision))

class CharacterConsistencyAnalyzer:
    """Automated character consistency scoring with CHARACTER_DNA anchoring"""

    def __init__(self, standards: QualityStandards):
        self.standards = standards
        self.character_templates = self._load_character_templates()

    def _load_character_templates(self) -> Dict[str, Any]:
        """Load character model sheets for comparison"""
        # This would load actual model sheets in a real implementation
        # For now, return template structure
        return {
            'alice': {
                'hair_features': ['pulled_back', 'low_bun', 'severe_part'],
                'notebook_requirement': True,
                'face_template': None,  # Would load actual template image
                'pose_templates': None
            },
            'arni': {
                'ponytail_requirement': True,
                'jacket_features': ['leather', 'motorcycle_collar'],
                'face_template': None,
                'pose_templates': None
            }
        }

    def analyze_character_consistency(self, image: np.ndarray, expected_characters: List[str]) -> Dict[str, QualityResult]:
        """Analyze character consistency across panels"""
        results = {}

        for character in expected_characters:
            if character.lower() == 'arni':
                results['arni_ponytail'] = self._check_arni_ponytail_visibility(image)
                results['arni_jacket'] = self._check_arni_jacket_consistency(image)
            elif character.lower() == 'alice':
                results['alice_notebook'] = self._check_alice_notebook_presence(image)
                results['alice_hair'] = self._check_alice_hair_consistency(image)

        return results

    def _check_arni_ponytail_visibility(self, image: np.ndarray) -> QualityResult:
        """Арни ponytail visibility mandate enforcement"""
        try:
            # Convert to grayscale for hair detection
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

            # Apply edge detection to find hair boundaries
            edges = cv2.Canny(gray, 50, 150)

            # Look for vertical hair-like structures (simplified ponytail detection)
            # This is a simplified version - real implementation would use ML models
            vertical_kernel = np.array([[1], [1], [1], [1], [1]], dtype=np.float32)
            vertical_edges = cv2.filter2D(edges, -1, vertical_kernel)

            # Calculate ponytail visibility score
            ponytail_score = self._calculate_ponytail_score(vertical_edges)

            return QualityResult(
                check_name="arni_ponytail_visibility",
                passed=ponytail_score >= self.standards.character_recognition_threshold,
                score=ponytail_score,
                confidence=0.75,  # Lower confidence - simplified detection
                details={
                    'ponytail_score': ponytail_score,
                    'detection_method': 'edge_detection_vertical_structures',
                    'threshold': self.standards.character_recognition_threshold
                },
                critical=self.standards.ponytail_visibility_requirement
            )

        except Exception as e:
            logger.error(f"Ponytail visibility check failed: {e}")
            return QualityResult(
                check_name="arni_ponytail_visibility",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

    def _check_alice_notebook_presence(self, image: np.ndarray) -> QualityResult:
        """Alice sage notebook #839E75 presence verification"""
        try:
            # Check for sage color presence
            sage_rgb = np.array(self.standards.spot_color_rgb)
            tolerance = int(255 * 0.05)  # 5% tolerance for notebook detection

            # Create color mask
            lower_bound = np.clip(sage_rgb - tolerance, 0, 255)
            upper_bound = np.clip(sage_rgb + tolerance, 0, 255)

            mask = cv2.inRange(image, lower_bound, upper_bound)
            sage_pixels = np.sum(mask > 0)

            # Look for rectangular shapes (notebook-like)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            rectangular_score = self._find_rectangular_objects(contours)

            # Combined score: color presence + rectangular shape
            notebook_score = min(1.0, (sage_pixels / 1000) * rectangular_score)

            return QualityResult(
                check_name="alice_notebook_presence",
                passed=notebook_score >= 0.3,  # Threshold for notebook presence
                score=notebook_score,
                confidence=0.80,
                details={
                    'sage_pixels_detected': int(sage_pixels),
                    'rectangular_score': rectangular_score,
                    'notebook_score': notebook_score,
                    'target_color': self.standards.spot_color_hex
                },
                critical=self.standards.alice_notebook_requirement
            )

        except Exception as e:
            logger.error(f"Alice notebook presence check failed: {e}")
            return QualityResult(
                check_name="alice_notebook_presence",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

    def _check_arni_jacket_consistency(self, image: np.ndarray) -> QualityResult:
        """Арни leather jacket consistency verification"""
        try:
            # Simple texture analysis for leather-like appearance
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

            # Look for dark regions (black jacket)
            dark_mask = gray < 50  # Dark threshold
            dark_pixels = np.sum(dark_mask)

            # Texture analysis using Local Binary Pattern (simplified)
            texture_score = self._analyze_jacket_texture(gray, dark_mask)

            return QualityResult(
                check_name="arni_jacket_consistency",
                passed=texture_score >= 0.5,
                score=texture_score,
                confidence=0.70,
                details={
                    'dark_pixels_detected': int(dark_pixels),
                    'texture_score': texture_score,
                    'analysis_method': 'dark_region_texture_analysis'
                },
                critical=False
            )

        except Exception as e:
            logger.error(f"Jacket consistency check failed: {e}")
            return QualityResult(
                check_name="arni_jacket_consistency",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=False
            )

    def _check_alice_hair_consistency(self, image: np.ndarray) -> QualityResult:
        """Alice hair consistency (pulled back, bun visible)"""
        try:
            # Simplified hair consistency check
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

            # Look for hair-like structures
            edges = cv2.Canny(gray, 30, 100)

            # Check for compact hair arrangement (bun-like)
            hair_compactness = self._measure_hair_compactness(edges)

            return QualityResult(
                check_name="alice_hair_consistency",
                passed=hair_compactness >= 0.6,
                score=hair_compactness,
                confidence=0.65,
                details={
                    'hair_compactness': hair_compactness,
                    'analysis_method': 'edge_detection_compactness'
                },
                critical=False
            )

        except Exception as e:
            logger.error(f"Alice hair consistency check failed: {e}")
            return QualityResult(
                check_name="alice_hair_consistency",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=False
            )

    def _calculate_ponytail_score(self, vertical_edges: np.ndarray) -> float:
        """Calculate ponytail visibility score"""
        # Look for vertical structures in the expected ponytail region
        height, width = vertical_edges.shape

        # Focus on back/side regions where ponytail would be
        back_region = vertical_edges[:, int(width * 0.6):]
        side_regions = [
            vertical_edges[:, :int(width * 0.2)],  # Left side
            vertical_edges[:, int(width * 0.8):]   # Right side
        ]

        # Calculate vertical structure density
        back_density = np.sum(back_region > 0) / back_region.size
        side_density = max(np.sum(region > 0) / region.size for region in side_regions)

        # Combined score
        ponytail_score = max(back_density, side_density) * 10  # Scale to 0-1 range
        return min(1.0, ponytail_score)

    def _find_rectangular_objects(self, contours: List[np.ndarray]) -> float:
        """Find rectangular objects (notebook-like shapes)"""
        if not contours:
            return 0.0

        rectangular_score = 0.0
        for contour in contours:
            if len(contour) < 4:
                continue

            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)

            # Check if it's roughly rectangular (4-6 vertices)
            if 4 <= len(approx) <= 6:
                area = cv2.contourArea(contour)
                if area > 100:  # Minimum size threshold
                    rectangular_score = max(rectangular_score, min(1.0, area / 1000))

        return rectangular_score

    def _analyze_jacket_texture(self, gray: np.ndarray, dark_mask: np.ndarray) -> float:
        """Analyze jacket texture for consistency"""
        if np.sum(dark_mask) == 0:
            return 0.0

        # Extract dark regions
        dark_regions = gray[dark_mask]

        # Calculate texture variance (leather should have some texture variation)
        texture_variance = np.var(dark_regions)

        # Normalize to 0-1 score
        # Good leather texture should have moderate variance (not too smooth, not too noisy)
        optimal_variance = 100  # Empirical value
        texture_score = 1.0 - abs(texture_variance - optimal_variance) / optimal_variance

        return max(0.0, min(1.0, texture_score))

    def _measure_hair_compactness(self, edges: np.ndarray) -> float:
        """Measure hair compactness (bun vs loose hair)"""
        # Find connected components
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return 0.0

        # Calculate compactness of largest hair regions
        compactness_scores = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 50:  # Minimum hair region size
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    # Compactness = 4π × area / perimeter²
                    compactness = (4 * np.pi * area) / (perimeter ** 2)
                    compactness_scores.append(compactness)

        if not compactness_scores:
            return 0.0

        # Higher compactness indicates more bun-like arrangement
        return min(1.0, max(compactness_scores))

class TechnicalQualityValidator:
    """Enhanced technical quality validation with commercial publication standards"""

    def __init__(self, standards: QualityStandards):
        self.standards = standards

    def validate_technical_quality(self, image_path: str, image: np.ndarray) -> List[QualityResult]:
        """Comprehensive technical validation"""
        results = []

        # Load image metadata
        with Image.open(image_path) as pil_image:
            # Resolution validation
            results.append(self._validate_resolution(pil_image, image_path))

            # Dimension validation
            results.append(self._validate_dimensions(pil_image))

            # Format validation
            results.append(self._validate_format(pil_image, image_path))

            # File size validation
            results.append(self._validate_file_size(image_path))

            # Color profile validation
            results.append(self._validate_color_profile(pil_image))

            # PDF/X-1a compliance check
            results.append(self._validate_print_readiness(pil_image, image_path))

        return results

    def _validate_resolution(self, image: Image.Image, image_path: str) -> QualityResult:
        """600 DPI enforcement with metadata verification"""
        try:
            dpi = image.info.get('dpi', (0, 0))
            if isinstance(dpi, tuple):
                dpi_x, dpi_y = dpi
            else:
                dpi_x = dpi_y = dpi

            # Banking-level precision check
            meets_standard = (dpi_x >= self.standards.minimum_dpi and
                            dpi_y >= self.standards.minimum_dpi)

            # Calculate score based on how close to standard
            if meets_standard:
                score = 1.0
            else:
                score = min(dpi_x, dpi_y) / self.standards.minimum_dpi

            return QualityResult(
                check_name="resolution_validation",
                passed=meets_standard,
                score=score,
                confidence=0.99,  # High confidence - direct metadata read
                details={
                    'actual_dpi': {'x': dpi_x, 'y': dpi_y},
                    'required_dpi': self.standards.minimum_dpi,
                    'metadata_source': 'EXIF_DPI_tags'
                },
                critical=True,  # Critical for print quality
                evidence=f"DPI metadata: {dpi_x}x{dpi_y}"
            )

        except Exception as e:
            logger.error(f"Resolution validation failed for {image_path}: {e}")
            return QualityResult(
                check_name="resolution_validation",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

    def _validate_dimensions(self, image: Image.Image) -> QualityResult:
        """4125x6262px dimension compliance automation"""
        actual_width, actual_height = image.size
        target_width, target_height = self.standards.target_dimensions
        tolerance = self.standards.dimension_tolerance_pixels

        width_diff = abs(actual_width - target_width)
        height_diff = abs(actual_height - target_height)

        width_compliant = width_diff <= tolerance
        height_compliant = height_diff <= tolerance
        dimensions_valid = width_compliant and height_compliant

        # Calculate precision score
        max_diff = max(width_diff, height_diff)
        if max_diff <= tolerance:
            score = 1.0
        else:
            # Degrade score based on deviation
            score = max(0.0, 1.0 - (max_diff - tolerance) / 100)

        return QualityResult(
            check_name="dimension_validation",
            passed=dimensions_valid,
            score=score,
            confidence=0.99,
            details={
                'actual_dimensions': {'width': actual_width, 'height': actual_height},
                'target_dimensions': {'width': target_width, 'height': target_height},
                'tolerance_pixels': tolerance,
                'differences': {'width': width_diff, 'height': height_diff},
                'width_compliant': width_compliant,
                'height_compliant': height_compliant
            },
            critical=True,  # Critical for print layout
            evidence=f"Dimensions: {actual_width}x{actual_height} (Target: {target_width}x{target_height})"
        )

    def _validate_format(self, image: Image.Image, image_path: str) -> QualityResult:
        """Format validation for commercial standards"""
        file_extension = Path(image_path).suffix.lower()
        image_format = image.format

        format_acceptable = image_format in self.standards.acceptable_formats

        return QualityResult(
            check_name="format_validation",
            passed=format_acceptable,
            score=1.0 if format_acceptable else 0.0,
            confidence=0.99,
            details={
                'file_extension': file_extension,
                'detected_format': image_format,
                'acceptable_formats': self.standards.acceptable_formats
            },
            critical=False,
            evidence=f"Format: {image_format} ({file_extension})"
        )

    def _validate_file_size(self, image_path: str) -> QualityResult:
        """File size validation with dual standards"""
        file_size_bytes = os.path.getsize(image_path)
        file_size_mb = file_size_bytes / (1024 * 1024)
        file_size_kb = file_size_bytes / 1024

        working_size_ok = file_size_mb <= self.standards.max_file_size_mb
        digital_size_ok = file_size_kb <= self.standards.max_digital_size_kb

        return QualityResult(
            check_name="file_size_validation",
            passed=working_size_ok,  # Primary check for working files
            score=1.0 if working_size_ok else max(0.0, 1.0 - (file_size_mb - self.standards.max_file_size_mb) / 50),
            confidence=0.99,
            details={
                'file_size_bytes': file_size_bytes,
                'file_size_mb': round(file_size_mb, 2),
                'file_size_kb': round(file_size_kb, 2),
                'working_file_limit_mb': self.standards.max_file_size_mb,
                'digital_limit_kb': self.standards.max_digital_size_kb,
                'working_size_compliant': working_size_ok,
                'digital_size_compliant': digital_size_ok
            },
            critical=False,
            evidence=f"Size: {file_size_mb:.2f}MB / {file_size_kb:.2f}KB"
        )

    def _validate_color_profile(self, image: Image.Image) -> QualityResult:
        """Color profile compliance validation"""
        color_mode = image.mode
        has_icc_profile = 'icc_profile' in image.info

        acceptable_modes = ['RGB', 'RGBA', 'CMYK', 'L', 'LA']
        mode_valid = color_mode in acceptable_modes

        # Score based on color mode appropriateness and profile presence
        score = 1.0 if mode_valid else 0.5
        if has_icc_profile and mode_valid:
            score = 1.0
        elif has_icc_profile:
            score = 0.8

        return QualityResult(
            check_name="color_profile_validation",
            passed=mode_valid,
            score=score,
            confidence=0.90,
            details={
                'color_mode': color_mode,
                'has_icc_profile': has_icc_profile,
                'acceptable_modes': acceptable_modes,
                'mode_valid': mode_valid
            },
            critical=False,
            evidence=f"Color mode: {color_mode}, ICC Profile: {has_icc_profile}"
        )

    def _validate_print_readiness(self, image: Image.Image, image_path: str) -> QualityResult:
        """PDF/X-1a format validation for print readiness"""
        try:
            # Check if file can be converted to print-ready format
            # This is a simplified check - full implementation would validate PDF/X-1a compliance

            print_ready_score = 1.0
            issues = []

            # Check color mode for print
            if image.mode not in ['CMYK', 'RGB']:
                print_ready_score -= 0.3
                issues.append(f"Color mode {image.mode} not optimal for print")

            # Check resolution for print
            dpi = image.info.get('dpi', (0, 0))
            if isinstance(dpi, tuple):
                min_dpi = min(dpi)
            else:
                min_dpi = dpi

            if min_dpi < 300:
                print_ready_score -= 0.5
                issues.append(f"DPI {min_dpi} below print minimum")

            return QualityResult(
                check_name="print_readiness_validation",
                passed=print_ready_score >= 0.8,
                score=max(0.0, print_ready_score),
                confidence=0.80,
                details={
                    'print_ready_score': print_ready_score,
                    'issues_found': issues,
                    'pdf_xa1_ready': print_ready_score >= 0.9
                },
                critical=self.standards.pdf_xa1_compliance,
                evidence=f"Print readiness: {print_ready_score:.2f}"
            )

        except Exception as e:
            logger.error(f"Print readiness validation failed: {e}")
            return QualityResult(
                check_name="print_readiness_validation",
                passed=False,
                score=0.0,
                confidence=0.0,
                details={'error': str(e)},
                critical=True
            )

class QualityDashboard:
    """Real-time quality metrics visualization and reporting"""

    def __init__(self, output_dir: str = "./qa_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.metrics_history = []

    def generate_dashboard_report(self, panel_reports: List[PanelQualityReport]) -> str:
        """Generate comprehensive quality dashboard"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.output_dir / f"quality_dashboard_{timestamp}.html"

        # Calculate aggregate metrics
        total_panels = len(panel_reports)
        passed_panels = sum(1 for report in panel_reports if report.overall_passed)
        pass_rate = (passed_panels / total_panels * 100) if total_panels > 0 else 0

        average_score = sum(report.overall_score for report in panel_reports) / total_panels if total_panels > 0 else 0

        # Generate HTML dashboard
        html_content = self._generate_dashboard_html(
            panel_reports, total_panels, passed_panels, pass_rate, average_score
        )

        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)

        logger.info(f"Quality dashboard generated: {report_file}")
        return str(report_file)

    def _generate_dashboard_html(self, panel_reports: List[PanelQualityReport],
                                total_panels: int, passed_panels: int,
                                pass_rate: float, average_score: float) -> str:
        """Generate HTML dashboard content"""

        # Create detailed panel results table
        panel_rows = []
        for report in panel_reports:
            status_class = "success" if report.overall_passed else "danger"
            panel_rows.append(f"""
                <tr class="{status_class}">
                    <td>{Path(report.file_path).name}</td>
                    <td>{report.overall_score:.2f}</td>
                    <td>{report.compliance_level}</td>
                    <td>{len([r for r in report.quality_results if r.critical and not r.passed])}</td>
                    <td>{len(report.recommendations)}</td>
                </tr>
            """)

        # Create quality metrics summary
        quality_checks = defaultdict(list)
        for report in panel_reports:
            for check in report.quality_results:
                quality_checks[check.check_name].append(check.score)

        metrics_rows = []
        for check_name, scores in quality_checks.items():
            avg_score = sum(scores) / len(scores)
            pass_count = sum(1 for score in scores if score >= 0.8)
            pass_rate_check = (pass_count / len(scores) * 100)

            metrics_rows.append(f"""
                <tr>
                    <td>{check_name.replace('_', ' ').title()}</td>
                    <td>{avg_score:.3f}</td>
                    <td>{pass_rate_check:.1f}%</td>
                    <td>{len(scores)}</td>
                </tr>
            """)

        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comic QA Dashboard - Banking Level Quality Assurance</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #2c3e50, #4a6741);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .metric-card {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }}
        .metric-value {{
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
        }}
        .metric-label {{
            color: #666;
            margin-top: 10px;
        }}
        .pass-rate {{
            color: {'#27ae60' if pass_rate >= 90 else '#e74c3c' if pass_rate < 70 else '#f39c12'};
        }}
        .section {{
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .section-header {{
            background: #34495e;
            color: white;
            padding: 20px;
            font-size: 1.3em;
            font-weight: bold;
        }}
        .section-content {{
            padding: 20px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background-color: #f8f9fa;
            font-weight: bold;
        }}
        .success {{
            background-color: #d4edda;
        }}
        .danger {{
            background-color: #f8d7da;
        }}
        .timestamp {{
            text-align: right;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }}
        .banking-badge {{
            background: #839E75;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            display: inline-block;
            margin-left: 10px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Comic Production QA Dashboard</h1>
        <h2>Banking-Level Precision Quality Assurance <span class="banking-badge">Zero Defect Tolerance</span></h2>
        <p>Enhanced Alice v2.0 Level 3 - Constitutional Framework Compliance</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{total_panels}</div>
            <div class="metric-label">Total Panels Analyzed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value pass-rate">{pass_rate:.1f}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{average_score:.3f}</div>
            <div class="metric-label">Average Quality Score</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{passed_panels}</div>
            <div class="metric-label">Panels Approved</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">Panel Results Summary</div>
        <div class="section-content">
            <table>
                <thead>
                    <tr>
                        <th>Panel File</th>
                        <th>Quality Score</th>
                        <th>Compliance Level</th>
                        <th>Critical Issues</th>
                        <th>Recommendations</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(panel_rows)}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-header">Quality Metrics Breakdown</div>
        <div class="section-content">
            <table>
                <thead>
                    <tr>
                        <th>Quality Check</th>
                        <th>Average Score</th>
                        <th>Pass Rate</th>
                        <th>Samples</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(metrics_rows)}
                </tbody>
            </table>
        </div>
    </div>

    <div class="timestamp">
        Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} UTC<br>
        QA Automation System v1.0 - Johnny (QA Architecture Specialist)
    </div>
</body>
</html>
        """

        return html

    def generate_individual_panel_report(self, panel_report: PanelQualityReport) -> str:
        """Generate detailed individual panel report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        panel_name = Path(panel_report.file_path).stem
        report_file = self.output_dir / f"panel_report_{panel_name}_{timestamp}.json"

        # Convert to serializable format
        report_data = asdict(panel_report)

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, default=str)

        logger.info(f"Individual panel report generated: {report_file}")
        return str(report_file)

class ComicQAAutomationSystem:
    """Main QA Automation System - Banking-Level Orchestration"""

    def __init__(self, standards: QualityStandards = None, output_dir: str = "./qa_reports"):
        self.standards = standards or QualityStandards()
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Initialize subsystems
        self.color_detector = ColorContaminationDetector(self.standards)
        self.character_analyzer = CharacterConsistencyAnalyzer(self.standards)
        self.technical_validator = TechnicalQualityValidator(self.standards)
        self.dashboard = QualityDashboard(output_dir)

        logger.info("QA Automation System initialized with banking-level precision")

    def analyze_panel(self, image_path: str, expected_characters: List[str] = None) -> PanelQualityReport:
        """Complete panel analysis with all quality checks"""
        logger.info(f"Starting comprehensive analysis of: {image_path}")

        if expected_characters is None:
            expected_characters = ['alice', 'arni']  # Default characters

        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Run all quality checks
            quality_results = []

            # 1. Technical Quality Validation
            technical_results = self.technical_validator.validate_technical_quality(image_path, image_rgb)
            quality_results.extend(technical_results)

            # 2. Color Contamination Detection
            spot_color_result = self.color_detector.detect_spot_color_precision(image_rgb)
            bleeding_result = self.color_detector.detect_bleeding(image_rgb)
            quality_results.extend([spot_color_result, bleeding_result])

            # 3. Character Consistency Analysis
            character_results = self.character_analyzer.analyze_character_consistency(
                image_rgb, expected_characters
            )
            quality_results.extend(character_results.values())

            # Calculate overall scores and compliance
            overall_score = self._calculate_overall_score(quality_results)
            overall_passed = self._determine_overall_pass(quality_results, overall_score)
            compliance_level = self._determine_compliance_level(overall_score, overall_passed)

            # Extract character consistency scores
            character_consistency = {
                name: result.score for name, result in character_results.items()
            }

            # Extract color analysis details
            color_analysis = {
                'spot_color_precision': spot_color_result.score,
                'bleeding_detected': not bleeding_result.passed,
                'color_distribution': spot_color_result.details.get('color_distribution', {})
            }

            # Extract technical metrics
            technical_metrics = {
                result.check_name: {
                    'score': result.score,
                    'passed': result.passed,
                    'details': result.details
                }
                for result in technical_results
            }

            # Generate recommendations
            recommendations = self._generate_recommendations(quality_results)

            # Create comprehensive report
            panel_report = PanelQualityReport(
                file_path=image_path,
                overall_passed=overall_passed,
                overall_score=overall_score,
                compliance_level=compliance_level,
                quality_results=quality_results,
                character_consistency=character_consistency,
                color_analysis=color_analysis,
                technical_metrics=technical_metrics,
                recommendations=recommendations,
                evidence_files=[]  # Could be populated with generated evidence images
            )

            logger.info(f"Analysis complete: {compliance_level} (Score: {overall_score:.3f})")
            return panel_report

        except Exception as e:
            logger.error(f"Panel analysis failed for {image_path}: {e}")
            # Return error report
            error_report = PanelQualityReport(
                file_path=image_path,
                overall_passed=False,
                overall_score=0.0,
                compliance_level="ERROR",
                quality_results=[QualityResult(
                    check_name="system_error",
                    passed=False,
                    score=0.0,
                    confidence=0.0,
                    details={'error': str(e)},
                    critical=True
                )],
                character_consistency={},
                color_analysis={},
                technical_metrics={},
                recommendations=[f"System error during analysis: {str(e)}"],
                evidence_files=[]
            )
            return error_report

    def analyze_batch(self, panels_directory: str, file_pattern: str = "*.png") -> List[PanelQualityReport]:
        """Batch analysis of multiple panels"""
        panels_path = Path(panels_directory)
        if not panels_path.exists():
            raise ValueError(f"Panels directory does not exist: {panels_directory}")

        # Find all matching panel files
        panel_files = list(panels_path.glob(file_pattern))
        if not panel_files:
            logger.warning(f"No panel files found matching pattern: {file_pattern}")
            return []

        logger.info(f"Starting batch analysis of {len(panel_files)} panels")

        # Analyze each panel
        panel_reports = []
        for panel_file in sorted(panel_files):
            logger.info(f"Processing: {panel_file.name}")
            report = self.analyze_panel(str(panel_file))
            panel_reports.append(report)

            # Generate individual report
            self.dashboard.generate_individual_panel_report(report)

        # Generate dashboard
        dashboard_file = self.dashboard.generate_dashboard_report(panel_reports)
        logger.info(f"Batch analysis complete. Dashboard: {dashboard_file}")

        return panel_reports

    def _calculate_overall_score(self, quality_results: List[QualityResult]) -> float:
        """Calculate weighted overall quality score"""
        if not quality_results:
            return 0.0

        # Weight critical checks higher
        total_weighted_score = 0.0
        total_weight = 0.0

        for result in quality_results:
            weight = 2.0 if result.critical else 1.0
            weighted_score = result.score * result.confidence * weight

            total_weighted_score += weighted_score
            total_weight += weight

        return total_weighted_score / total_weight if total_weight > 0 else 0.0

    def _determine_overall_pass(self, quality_results: List[QualityResult], overall_score: float) -> bool:
        """Determine if panel passes overall quality requirements"""
        # Check for critical failures
        critical_failures = [r for r in quality_results if r.critical and not r.passed]
        if critical_failures:
            return False

        # Check overall score threshold
        if overall_score < self.standards.overall_pass_threshold:
            return False

        # Check for too many minor failures
        failed_checks = [r for r in quality_results if not r.passed]
        failure_rate = len(failed_checks) / len(quality_results) if quality_results else 0

        return failure_rate < 0.3  # Allow up to 30% minor failures

    def _determine_compliance_level(self, overall_score: float, overall_passed: bool) -> str:
        """Determine compliance level classification"""
        if not overall_passed:
            if overall_score < self.standards.critical_failure_threshold:
                return "CRITICAL_FAILURE"
            else:
                return "NON_COMPLIANT"

        if overall_score >= 0.95:
            return "COMMERCIAL_READY"
        elif overall_score >= 0.90:
            return "COMPLIANT"
        else:
            return "MARGINAL_PASS"

    def _generate_recommendations(self, quality_results: List[QualityResult]) -> List[str]:
        """Generate actionable recommendations based on quality results"""
        recommendations = []

        for result in quality_results:
            if not result.passed:
                if result.check_name == "resolution_validation":
                    recommendations.append(f"Increase image resolution to {self.standards.minimum_dpi} DPI minimum")
                elif result.check_name == "dimension_validation":
                    target = self.standards.target_dimensions
                    recommendations.append(f"Resize image to exact dimensions: {target[0]}x{target[1]} pixels")
                elif result.check_name == "spot_color_precision":
                    recommendations.append(f"Improve spot color precision for {self.standards.spot_color_hex}")
                elif result.check_name == "color_bleeding_detection":
                    recommendations.append("Address color bleeding issues detected in image")
                elif result.check_name == "arni_ponytail_visibility":
                    recommendations.append("Ensure Арни's ponytail is clearly visible from current viewing angle")
                elif result.check_name == "alice_notebook_presence":
                    recommendations.append(f"Verify Alice's sage notebook ({self.standards.spot_color_hex}) is present and visible")
                elif "consistency" in result.check_name:
                    recommendations.append("Review character consistency against model sheets")
                else:
                    recommendations.append(f"Address {result.check_name.replace('_', ' ')} issue")

        # Add quality improvement suggestions
        if len(recommendations) > 5:
            recommendations.append("Consider comprehensive panel review due to multiple quality issues")

        return recommendations

def main():
    """Command line interface for QA Automation System"""
    parser = argparse.ArgumentParser(description="Comic Production QA Automation System")
    parser.add_argument("input_path", help="Path to panel file or directory")
    parser.add_argument("--output", "-o", default="./qa_reports", help="Output directory for reports")
    parser.add_argument("--pattern", "-p", default="*.png", help="File pattern for batch processing")
    parser.add_argument("--characters", "-c", nargs="+", default=["alice", "arni"],
                       help="Expected characters in panels")
    parser.add_argument("--standards", "-s", help="Custom standards JSON file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Load custom standards if provided
    standards = QualityStandards()
    if args.standards:
        with open(args.standards) as f:
            standards_data = json.load(f)
            standards = QualityStandards(**standards_data)

    # Initialize QA system
    qa_system = ComicQAAutomationSystem(standards, args.output)

    input_path = Path(args.input_path)

    try:
        if input_path.is_file():
            # Single panel analysis
            print(f"Analyzing single panel: {input_path}")
            report = qa_system.analyze_panel(str(input_path), args.characters)

            # Generate individual report
            report_file = qa_system.dashboard.generate_individual_panel_report(report)

            print(f"\nAnalysis Results:")
            print(f"Overall Score: {report.overall_score:.3f}")
            print(f"Compliance Level: {report.compliance_level}")
            print(f"Passed: {'✓' if report.overall_passed else '✗'}")
            print(f"Detailed report: {report_file}")

            if report.recommendations:
                print(f"\nRecommendations:")
                for i, rec in enumerate(report.recommendations, 1):
                    print(f"{i}. {rec}")

        elif input_path.is_dir():
            # Batch analysis
            print(f"Analyzing panels in directory: {input_path}")
            reports = qa_system.analyze_batch(str(input_path), args.pattern)

            if reports:
                passed_count = sum(1 for r in reports if r.overall_passed)
                avg_score = sum(r.overall_score for r in reports) / len(reports)

                print(f"\nBatch Analysis Results:")
                print(f"Total Panels: {len(reports)}")
                print(f"Passed: {passed_count} ({passed_count/len(reports)*100:.1f}%)")
                print(f"Average Score: {avg_score:.3f}")
                print(f"Reports generated in: {args.output}")
            else:
                print("No panels found for analysis")

        else:
            print(f"Error: {input_path} is not a valid file or directory")
            sys.exit(1)

    except Exception as e:
        logger.error(f"QA system error: {e}")
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()