#!/usr/bin/env python3
"""
QA System Setup Script
Automated installation and verification for comic QA automation system
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_banner():
    print("="*70)
    print("  Comic Production QA Automation System Setup")
    print("  Banking-Level Precision - Zero Defect Tolerance")
    print("  Enhanced Alice v2.0 Level 3 Constitutional Framework")
    print("="*70)
    print()

def check_python_version():
    """Check if Python version is adequate"""
    print("🐍 Checking Python version...")

    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} detected")
        print("   Required: Python 3.8 or higher")
        return False

    print(f"✓ Python {version.major}.{version.minor}.{version.micro} - Compatible")
    return True

def check_pip():
    """Check if pip is available"""
    print("📦 Checking pip availability...")

    try:
        import pip
        print("✓ pip is available")
        return True
    except ImportError:
        try:
            subprocess.run([sys.executable, "-m", "pip", "--version"],
                         check=True, capture_output=True)
            print("✓ pip module available")
            return True
        except subprocess.CalledProcessError:
            print("❌ pip not found")
            print("   Install pip: https://pip.pypa.io/en/stable/installation/")
            return False

def install_dependencies():
    """Install required dependencies"""
    print("📚 Installing dependencies...")

    script_dir = Path(__file__).parent
    requirements_file = script_dir / "requirements.txt"

    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False

    try:
        # Install requirements
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)

        print("✓ Dependencies installed successfully")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies:")
        print(f"   {e.stderr}")
        return False

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing module imports...")

    modules = [
        ("PIL", "Pillow"),
        ("cv2", "opencv-python"),
        ("numpy", "numpy"),
        ("sklearn", "scikit-learn")
    ]

    all_good = True

    for module_name, package_name in modules:
        try:
            __import__(module_name)
            print(f"✓ {module_name} ({package_name})")
        except ImportError:
            print(f"❌ {module_name} ({package_name}) - Not available")
            all_good = False

    return all_good

def test_qa_system():
    """Test if QA system components work"""
    print("🧪 Testing QA system components...")

    try:
        # Test basic import
        from qa_automation_system import ComicQAAutomationSystem, QualityStandards
        print("✓ QA automation system imports successfully")

        # Test initialization
        standards = QualityStandards()
        qa_system = ComicQAAutomationSystem(standards, "./test_output")
        print("✓ QA system initializes successfully")

        return True

    except Exception as e:
        print(f"❌ QA system test failed: {e}")
        return False

def create_test_directories():
    """Create necessary test directories"""
    print("📁 Creating test directories...")

    script_dir = Path(__file__).parent
    test_dirs = ["./qa_reports", "./test_panels", "./test_output"]

    for dir_path in test_dirs:
        full_path = script_dir / dir_path
        full_path.mkdir(exist_ok=True)
        print(f"✓ Created: {dir_path}")

    return True

def run_system_test():
    """Run the automated test suite"""
    print("🚀 Running system tests...")

    script_dir = Path(__file__).parent
    test_script = script_dir / "test_qa_system.py"

    if not test_script.exists():
        print("⚠ test_qa_system.py not found - skipping automated tests")
        return True

    try:
        result = subprocess.run([sys.executable, str(test_script)],
                              check=True, capture_output=True, text=True)

        # Show last few lines of output
        lines = result.stdout.strip().split('\n')
        for line in lines[-10:]:
            if '✓' in line or '❌' in line or 'PASS' in line or 'FAIL' in line:
                print(f"  {line}")

        print("✓ System tests completed successfully")
        return True

    except subprocess.CalledProcessError as e:
        print(f"⚠ Some system tests failed:")
        print(f"   Run 'python test_qa_system.py' for details")
        return False

def create_launcher_scripts():
    """Ensure launcher scripts are executable"""
    print("🔧 Setting up launcher scripts...")

    script_dir = Path(__file__).parent

    # Make shell script executable on Unix-like systems
    if platform.system() != "Windows":
        shell_script = script_dir / "run_qa.sh"
        if shell_script.exists():
            os.chmod(shell_script, 0o755)
            print("✓ run_qa.sh made executable")

    # Check batch file on Windows
    if platform.system() == "Windows":
        batch_script = script_dir / "run_qa.bat"
        if batch_script.exists():
            print("✓ run_qa.bat available")

    return True

def print_usage_instructions():
    """Print instructions for using the QA system"""
    print("\n" + "="*70)
    print("  SETUP COMPLETE - USAGE INSTRUCTIONS")
    print("="*70)
    print()
    print("📋 Quick Start:")
    print("   # Analyze single panel")
    print("   python qa_automation_system.py /path/to/panel.png")
    print()
    print("   # Analyze directory of panels")
    print("   python qa_automation_system.py /path/to/panels/")
    print()
    print("   # Use launcher script (Unix/Linux/Mac)")
    print("   ./run_qa.sh /path/to/panels/")
    print()
    print("   # Use launcher script (Windows)")
    print("   run_qa.bat /path/to/panels/")
    print()
    print("   # Use legacy validator")
    print("   python validate_panel_quality.py /path/to/panels/")
    print()
    print("📖 Documentation:")
    print("   Read QA_SYSTEM_DOCUMENTATION.md for complete guide")
    print()
    print("🧪 Testing:")
    print("   python test_qa_system.py")
    print()
    print("⚙️ Configuration:")
    print("   Edit qa_standards.json to customize quality standards")
    print()
    print("🆘 Support:")
    print("   - Check log files for debugging")
    print("   - Use --verbose flag for detailed output")
    print("   - Review documentation for troubleshooting")
    print()

def main():
    """Main setup routine"""
    print_banner()

    setup_steps = [
        ("Python Version Check", check_python_version),
        ("Pip Availability", check_pip),
        ("Dependency Installation", install_dependencies),
        ("Module Import Test", test_imports),
        ("QA System Test", test_qa_system),
        ("Directory Creation", create_test_directories),
        ("Launcher Setup", create_launcher_scripts),
        ("System Test Suite", run_system_test),
    ]

    results = []

    for step_name, step_func in setup_steps:
        print(f"\n🔄 {step_name}...")
        try:
            result = step_func()
            results.append((step_name, result))

            if not result:
                print(f"❌ {step_name} failed - setup incomplete")
                break

        except Exception as e:
            print(f"❌ {step_name} failed with error: {e}")
            results.append((step_name, False))
            break

    # Summary
    print("\n" + "="*70)
    print("  SETUP RESULTS SUMMARY")
    print("="*70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for step_name, result in results:
        status = "✓ SUCCESS" if result else "❌ FAILED"
        print(f"  {step_name:<30} {status}")

    print(f"\n  Overall: {passed}/{total} steps completed ({passed/total*100:.1f}%)")

    if passed == total:
        print("\n🎉 SETUP COMPLETE - QA System Ready for Production!")
        print_usage_instructions()
        return 0
    else:
        print("\n⚠ SETUP INCOMPLETE - Please resolve issues above")
        return 1

if __name__ == "__main__":
    sys.exit(main())