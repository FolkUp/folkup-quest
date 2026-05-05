#!/bin/bash
# Comic QA Automation System Launcher
# Banking-Level Precision - Zero Defect Tolerance
#
# Usage Examples:
#   ./run_qa.sh /path/to/panels                    # Full QA automation
#   ./run_qa.sh /path/to/panel.png --single        # Single panel analysis
#   ./run_qa.sh /path/to/panels --legacy           # Legacy validation only
#   ./run_qa.sh /path/to/panels --dashboard-only   # Generate dashboard from existing reports

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QA_SYSTEM="$SCRIPT_DIR/qa_automation_system.py"
LEGACY_VALIDATOR="$SCRIPT_DIR/validate_panel_quality.py"
STANDARDS_CONFIG="$SCRIPT_DIR/qa_standards.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE} Comic Production QA Automation System${NC}"
    echo -e "${BLUE} Banking-Level Precision - Zero Defect Tolerance${NC}"
    echo -e "${BLUE} Enhanced Alice v2.0 Level 3 Constitutional Framework${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

print_usage() {
    echo "Usage: $0 <input_path> [options]"
    echo ""
    echo "Arguments:"
    echo "  input_path          Path to panel file or directory"
    echo ""
    echo "Options:"
    echo "  --single, -s        Analyze single panel (auto-detected if file provided)"
    echo "  --legacy, -l        Use legacy validation system only"
    echo "  --dashboard-only    Generate dashboard from existing reports"
    echo "  --output, -o DIR    Output directory for reports (default: ./qa_reports)"
    echo "  --pattern, -p PATTERN File pattern for batch processing (default: *.png)"
    echo "  --characters, -c LIST Expected characters (default: alice arni)"
    echo "  --standards, -std FILE Custom standards JSON file"
    echo "  --verbose, -v       Verbose output"
    echo "  --help, -h          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 ./panels/                           # Analyze all panels"
    echo "  $0 ./panels/panel_1_1.png             # Analyze single panel"
    echo "  $0 ./panels/ --legacy                  # Use legacy validator"
    echo "  $0 ./panels/ --output ./custom_reports # Custom output directory"
    echo "  $0 ./panels/ --standards ./my_standards.json # Custom standards"
    echo ""
}

check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"

    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Error: Python 3 is required but not installed${NC}"
        exit 1
    fi

    # Check if advanced QA system is available
    if python3 -c "import cv2, sklearn, numpy" 2>/dev/null; then
        echo -e "${GREEN}✓ Advanced QA system dependencies available${NC}"
        ADVANCED_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠ Advanced QA system dependencies missing${NC}"
        echo -e "${YELLOW}  Install with: pip install -r requirements.txt${NC}"
        ADVANCED_AVAILABLE=false
    fi

    # Check if basic dependencies are available
    if python3 -c "import PIL" 2>/dev/null; then
        echo -e "${GREEN}✓ Basic validation dependencies available${NC}"
    else
        echo -e "${RED}Error: PIL (Pillow) is required. Install with: pip install Pillow${NC}"
        exit 1
    fi

    echo ""
}

validate_input() {
    local input_path="$1"

    if [[ ! -e "$input_path" ]]; then
        echo -e "${RED}Error: Input path does not exist: $input_path${NC}"
        exit 1
    fi

    if [[ -f "$input_path" ]]; then
        # Single file - check if it's an image
        case "${input_path,,}" in
            *.png|*.jpg|*.jpeg|*.tiff|*.tif)
                echo -e "${GREEN}✓ Single panel detected: $(basename "$input_path")${NC}"
                SINGLE_PANEL=true
                ;;
            *)
                echo -e "${RED}Error: File is not a recognized image format${NC}"
                exit 1
                ;;
        esac
    elif [[ -d "$input_path" ]]; then
        # Directory - check if it contains images
        local image_count=$(find "$input_path" -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.tiff" -o -iname "*.tif" \) | wc -l)
        if [[ $image_count -eq 0 ]]; then
            echo -e "${RED}Error: No image files found in directory${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Directory contains $image_count image files${NC}"
        SINGLE_PANEL=false
    fi

    echo ""
}

run_advanced_qa() {
    local input_path="$1"
    shift
    local args=("$@")

    echo -e "${BLUE}Running Advanced QA Automation System...${NC}"
    echo ""

    if [[ ! -f "$QA_SYSTEM" ]]; then
        echo -e "${RED}Error: QA automation system not found: $QA_SYSTEM${NC}"
        exit 1
    fi

    python3 "$QA_SYSTEM" "$input_path" "${args[@]}"
}

run_legacy_qa() {
    local input_path="$1"

    echo -e "${BLUE}Running Legacy Validation System...${NC}"
    echo ""

    if [[ ! -f "$LEGACY_VALIDATOR" ]]; then
        echo -e "${RED}Error: Legacy validator not found: $LEGACY_VALIDATOR${NC}"
        exit 1
    fi

    if [[ "$SINGLE_PANEL" == true ]]; then
        # For single panel, we need to create a temp directory
        temp_dir=$(mktemp -d)
        cp "$input_path" "$temp_dir/"
        python3 "$LEGACY_VALIDATOR" "$temp_dir" --legacy
        rm -rf "$temp_dir"
    else
        python3 "$LEGACY_VALIDATOR" "$input_path" --legacy
    fi
}

# Parse arguments
INPUT_PATH=""
USE_LEGACY=false
DASHBOARD_ONLY=false
OUTPUT_DIR=""
PATTERN="*.png"
CHARACTERS="alice arni"
STANDARDS_FILE=""
VERBOSE=false
SINGLE_PANEL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --single|-s)
            SINGLE_PANEL=true
            shift
            ;;
        --legacy|-l)
            USE_LEGACY=true
            shift
            ;;
        --dashboard-only)
            DASHBOARD_ONLY=true
            shift
            ;;
        --output|-o)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --pattern|-p)
            PATTERN="$2"
            shift 2
            ;;
        --characters|-c)
            CHARACTERS="$2"
            shift 2
            ;;
        --standards|-std)
            STANDARDS_FILE="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            print_header
            print_usage
            exit 0
            ;;
        -*)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo ""
            print_usage
            exit 1
            ;;
        *)
            if [[ -z "$INPUT_PATH" ]]; then
                INPUT_PATH="$1"
            else
                echo -e "${RED}Error: Multiple input paths specified${NC}"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check if input path was provided
if [[ -z "$INPUT_PATH" ]]; then
    echo -e "${RED}Error: Input path is required${NC}"
    echo ""
    print_usage
    exit 1
fi

# Main execution
print_header
check_dependencies
validate_input "$INPUT_PATH"

# Build arguments for QA system
QA_ARGS=()

if [[ -n "$OUTPUT_DIR" ]]; then
    QA_ARGS+=("--output" "$OUTPUT_DIR")
fi

if [[ -n "$PATTERN" ]] && [[ "$SINGLE_PANEL" == false ]]; then
    QA_ARGS+=("--pattern" "$PATTERN")
fi

if [[ -n "$CHARACTERS" ]]; then
    IFS=' ' read -ra CHAR_ARRAY <<< "$CHARACTERS"
    QA_ARGS+=("--characters" "${CHAR_ARRAY[@]}")
fi

if [[ -n "$STANDARDS_FILE" ]]; then
    if [[ ! -f "$STANDARDS_FILE" ]]; then
        echo -e "${RED}Error: Standards file not found: $STANDARDS_FILE${NC}"
        exit 1
    fi
    QA_ARGS+=("--standards" "$STANDARDS_FILE")
elif [[ -f "$STANDARDS_CONFIG" ]]; then
    QA_ARGS+=("--standards" "$STANDARDS_CONFIG")
fi

if [[ "$VERBOSE" == true ]]; then
    QA_ARGS+=("--verbose")
fi

# Execute QA system
if [[ "$DASHBOARD_ONLY" == true ]]; then
    echo -e "${BLUE}Dashboard-only mode not yet implemented${NC}"
    exit 1
elif [[ "$USE_LEGACY" == true ]] || [[ "$ADVANCED_AVAILABLE" == false ]]; then
    run_legacy_qa "$INPUT_PATH"
else
    run_advanced_qa "$INPUT_PATH" "${QA_ARGS[@]}"
fi

echo ""
echo -e "${GREEN}QA analysis completed successfully!${NC}"