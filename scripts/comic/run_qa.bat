@echo off
REM Comic QA Automation System Launcher (Windows)
REM Banking-Level Precision - Zero Defect Tolerance

setlocal EnableDelayedExpansion

REM Configuration
set "SCRIPT_DIR=%~dp0"
set "QA_SYSTEM=%SCRIPT_DIR%qa_automation_system.py"
set "LEGACY_VALIDATOR=%SCRIPT_DIR%validate_panel_quality.py"
set "STANDARDS_CONFIG=%SCRIPT_DIR%qa_standards.json"

REM Default values
set "USE_LEGACY=false"
set "OUTPUT_DIR="
set "PATTERN=*.png"
set "CHARACTERS=alice arni"
set "STANDARDS_FILE="
set "VERBOSE=false"

:parse_args
if "%~1"=="" goto check_input
if "%~1"=="--legacy" set "USE_LEGACY=true" & shift & goto parse_args
if "%~1"=="-l" set "USE_LEGACY=true" & shift & goto parse_args
if "%~1"=="--output" set "OUTPUT_DIR=%~2" & shift & shift & goto parse_args
if "%~1"=="-o" set "OUTPUT_DIR=%~2" & shift & shift & goto parse_args
if "%~1"=="--pattern" set "PATTERN=%~2" & shift & shift & goto parse_args
if "%~1"=="-p" set "PATTERN=%~2" & shift & shift & goto parse_args
if "%~1"=="--characters" set "CHARACTERS=%~2" & shift & shift & goto parse_args
if "%~1"=="-c" set "CHARACTERS=%~2" & shift & shift & goto parse_args
if "%~1"=="--standards" set "STANDARDS_FILE=%~2" & shift & shift & goto parse_args
if "%~1"=="--verbose" set "VERBOSE=true" & shift & goto parse_args
if "%~1"=="-v" set "VERBOSE=true" & shift & goto parse_args
if "%~1"=="--help" goto show_help
if "%~1"=="-h" goto show_help

if not defined INPUT_PATH (
    set "INPUT_PATH=%~1"
    shift
    goto parse_args
) else (
    echo Error: Multiple input paths specified
    goto show_usage
)

:check_input
if not defined INPUT_PATH (
    echo Error: Input path is required
    echo.
    goto show_usage
)

:print_header
echo ============================================================
echo  Comic Production QA Automation System
echo  Banking-Level Precision - Zero Defect Tolerance
echo  Enhanced Alice v2.0 Level 3 Constitutional Framework
echo ============================================================
echo.

:check_dependencies
echo Checking dependencies...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is required but not installed
    exit /b 1
)

REM Check if input exists
if not exist "%INPUT_PATH%" (
    echo Error: Input path does not exist: %INPUT_PATH%
    exit /b 1
)

:run_qa
echo Running QA Analysis...
echo.

REM Build Python command
set "PYTHON_CMD=python"

if "%USE_LEGACY%"=="true" (
    REM Use legacy validator
    if exist "%LEGACY_VALIDATOR%" (
        %PYTHON_CMD% "%LEGACY_VALIDATOR%" "%INPUT_PATH%" --legacy
    ) else (
        echo Error: Legacy validator not found
        exit /b 1
    )
) else (
    REM Use advanced QA system
    if exist "%QA_SYSTEM%" (
        set "QA_CMD=%PYTHON_CMD% "%QA_SYSTEM%" "%INPUT_PATH%""

        if defined OUTPUT_DIR set "QA_CMD=!QA_CMD! --output "%OUTPUT_DIR%""
        if defined STANDARDS_FILE set "QA_CMD=!QA_CMD! --standards "%STANDARDS_FILE%""
        if "%VERBOSE%"=="true" set "QA_CMD=!QA_CMD! --verbose"

        !QA_CMD!
    ) else (
        echo Error: QA automation system not found
        echo Falling back to legacy validator...
        if exist "%LEGACY_VALIDATOR%" (
            %PYTHON_CMD% "%LEGACY_VALIDATOR%" "%INPUT_PATH%" --legacy
        ) else (
            echo Error: No QA system available
            exit /b 1
        )
    )
)

echo.
echo QA analysis completed successfully!
goto :eof

:show_help
:show_usage
echo Usage: %0 ^<input_path^> [options]
echo.
echo Arguments:
echo   input_path          Path to panel file or directory
echo.
echo Options:
echo   --legacy, -l        Use legacy validation system only
echo   --output, -o DIR    Output directory for reports
echo   --pattern, -p PATTERN File pattern for batch processing
echo   --characters, -c LIST Expected characters
echo   --standards FILE    Custom standards JSON file
echo   --verbose, -v       Verbose output
echo   --help, -h          Show this help
echo.
echo Examples:
echo   %0 .\panels\
echo   %0 .\panels\panel_1_1.png
echo   %0 .\panels\ --legacy
echo   %0 .\panels\ --output .\custom_reports
echo.
goto :eof