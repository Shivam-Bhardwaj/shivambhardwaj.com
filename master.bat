@echo off
setlocal enabledelayedexpansion
title Master Controller - Shivam Bhardwaj Portfolio

:MAIN
cls
echo.
echo ====================================================
echo           MASTER PROJECT CONTROLLER
echo          Shivam Bhardwaj Portfolio v1.0
echo ====================================================
echo.
echo Select an option:
echo.
echo [1] Development       [D] Quick Dev Start
echo [2] Testing           [T] Quick Test Run
echo [3] Build & Deploy    [B] Quick Build
echo [4] Code Quality      [L] Quick Lint
echo [5] Security          [S] Security Check
echo [6] Utilities         [U] Project Status
echo [7] Git Operations    [G] Git Status
echo [8] Help              [C] Claude Helper
echo [0] Exit              [Q] Quick Exit
echo.
echo Quick Commands: D/T/B/L/S/U/G/C/Q (no Enter needed)
echo Menu Options: 0-8 (press Enter)
echo.
choice /c 123456780DTBLSUGCQ /n /m "Select option: "
set choice=%errorlevel%

if "%choice%"=="1" goto DEV
if "%choice%"=="2" goto TEST
if "%choice%"=="3" goto BUILD
if "%choice%"=="4" goto QUALITY
if "%choice%"=="5" goto SECURITY
if "%choice%"=="6" goto UTILS
if "%choice%"=="7" goto GIT
if "%choice%"=="8" goto HELP
if "%choice%"=="9" goto EXIT
if "%choice%"=="10" goto QUICK_DEV
if "%choice%"=="11" goto QUICK_TEST
if "%choice%"=="12" goto QUICK_BUILD
if "%choice%"=="13" goto QUICK_LINT
if "%choice%"=="14" goto QUICK_SECURITY
if "%choice%"=="15" goto QUICK_STATUS
if "%choice%"=="16" goto QUICK_GIT
if "%choice%"=="17" goto QUICK_CLAUDE
if "%choice%"=="18" goto QUICK_EXIT
goto INVALID

:DEV
cls
echo.
echo ====== DEVELOPMENT MENU ======
echo.
echo [1] Start Dev Server (npm run dev)
echo [2] Start Production Server (npm run start)
echo [3] Open in Browser
echo [4] View Logs
echo [0] Back to Main Menu
echo.
set /p devchoice="Enter your choice: "

if "%devchoice%"=="1" (
    echo Starting development server...
    start /B npm run dev
    echo Development server starting at http://localhost:3000
    timeout /t 3 > nul
    goto DEV
)
if "%devchoice%"=="2" (
    echo Starting production server...
    npm run start
    pause
    goto DEV
)
if "%devchoice%"=="3" (
    echo Opening browser...
    start http://localhost:3000
    goto DEV
)
if "%devchoice%"=="4" (
    echo Viewing recent logs...
    if exist "logs" dir logs /o-d
    pause
    goto DEV
)
if "%devchoice%"=="0" goto MAIN
goto DEV

:TEST
cls
echo.
echo ====== TESTING MENU ======
echo.
echo [1] Run All Tests (npm run test:all)
echo [2] Unit Tests (npm run test)
echo [3] Watch Mode Tests (npm run test:watch)
echo [4] Coverage Report (npm run test:coverage)
echo [5] E2E Tests (npm run test:e2e)
echo [6] E2E UI Mode (npm run test:e2e:ui)
echo [7] Accessibility Tests (npm run test:a11y)
echo [8] Performance Tests (npm run test:performance)
echo [9] CI Pipeline Tests (npm run test:ci)
echo [0] Back to Main Menu
echo.
set /p testchoice="Enter your choice: "

if "%testchoice%"=="1" (
    echo Running all tests...
    npm run test:all
    pause
    goto TEST
)
if "%testchoice%"=="2" (
    echo Running unit tests...
    npm run test
    pause
    goto TEST
)
if "%testchoice%"=="3" (
    echo Starting test watch mode...
    npm run test:watch
    pause
    goto TEST
)
if "%testchoice%"=="4" (
    echo Generating coverage report...
    npm run test:coverage
    pause
    goto TEST
)
if "%testchoice%"=="5" (
    echo Running E2E tests...
    npm run test:e2e
    pause
    goto TEST
)
if "%testchoice%"=="6" (
    echo Opening Playwright UI...
    npm run test:e2e:ui
    pause
    goto TEST
)
if "%testchoice%"=="7" (
    echo Running accessibility tests...
    npm run test:a11y
    pause
    goto TEST
)
if "%testchoice%"=="8" (
    echo Running performance tests...
    npm run test:performance
    pause
    goto TEST
)
if "%testchoice%"=="9" (
    echo Running CI pipeline tests...
    npm run test:ci
    pause
    goto TEST
)
if "%testchoice%"=="0" goto MAIN
goto TEST

:BUILD
cls
echo.
echo ====== BUILD & DEPLOY MENU ======
echo.
echo [1] Build for Production (npm run build)
echo [2] Clean Build Directories (npm run clean)
echo [3] Full Build Process (Clean + Build)
echo [4] Deploy to Firebase
echo [5] Quick Deploy
echo [6] Production Deploy
echo [7] Serve Built Files Locally
echo [0] Back to Main Menu
echo.
set /p buildchoice="Enter your choice: "

if "%buildchoice%"=="1" (
    echo Building for production...
    npm run build
    pause
    goto BUILD
)
if "%buildchoice%"=="2" (
    echo Cleaning build directories...
    npm run clean
    echo Clean completed.
    pause
    goto BUILD
)
if "%buildchoice%"=="3" (
    echo Running full build process...
    npm run clean
    echo Cleaned directories.
    npm run build
    echo Build completed.
    pause
    goto BUILD
)
if "%buildchoice%"=="4" (
    echo Deploying to Firebase...
    if exist "scripts\deploy-firebase.js" (
        node scripts\deploy-firebase.js
    ) else (
        echo Firebase deploy script not found. Running manual deploy...
        firebase deploy
    )
    pause
    goto BUILD
)
if "%buildchoice%"=="5" (
    echo Running quick deploy...
    if exist "scripts\deploy-quick.js" (
        node scripts\deploy-quick.js
    ) else (
        echo Quick deploy script not found.
    )
    pause
    goto BUILD
)
if "%buildchoice%"=="6" (
    echo Running production deploy...
    if exist "scripts\production-deploy.js" (
        node scripts\production-deploy.js
    ) else (
        echo Production deploy script not found.
    )
    pause
    goto BUILD
)
if "%buildchoice%"=="7" (
    echo Serving built files locally...
    if exist "out" (
        cd out
        python -m http.server 8000 2>nul || python -m SimpleHTTPServer 8000 2>nul || npx serve . -p 8000
        cd ..
    ) else (
        echo No build output found. Please run build first.
    )
    pause
    goto BUILD
)
if "%buildchoice%"=="0" goto MAIN
goto BUILD

:QUALITY
cls
echo.
echo ====== CODE QUALITY MENU ======
echo.
echo [1] Lint Code (npm run lint)
echo [2] Auto-fix Lint Issues (npm run lint:fix)
echo [3] Type Check (npm run type-check)
echo [4] Full Quality Check (Lint + Type Check)
echo [5] Run Quality Agent
echo [0] Back to Main Menu
echo.
set /p qualitychoice="Enter your choice: "

if "%qualitychoice%"=="1" (
    echo Running ESLint...
    npm run lint
    pause
    goto QUALITY
)
if "%qualitychoice%"=="2" (
    echo Auto-fixing lint issues...
    npm run lint:fix
    pause
    goto QUALITY
)
if "%qualitychoice%"=="3" (
    echo Running TypeScript type check...
    npm run type-check
    pause
    goto QUALITY
)
if "%qualitychoice%"=="4" (
    echo Running full quality check...
    echo.
    echo [1/2] Running ESLint...
    npm run lint
    echo.
    echo [2/2] Running TypeScript check...
    npm run type-check
    echo Quality check completed.
    pause
    goto QUALITY
)
if "%qualitychoice%"=="5" (
    echo Running quality check agent...
    if exist "scripts\quality-check-agent.js" (
        node scripts\quality-check-agent.js
    ) else (
        echo Quality agent not found.
    )
    pause
    goto QUALITY
)
if "%qualitychoice%"=="0" goto MAIN
goto QUALITY

:SECURITY
cls
echo.
echo ====== SECURITY MENU ======
echo.
echo [1] Security Audit (npm run security:audit)
echo [2] Security Scan (npm run security:scan)
echo [3] Security Tests (npm run test:security)
echo [4] Full Security Check
echo [0] Back to Main Menu
echo.
set /p secchoice="Enter your choice: "

if "%secchoice%"=="1" (
    echo Running security audit...
    npm run security:audit
    pause
    goto SECURITY
)
if "%secchoice%"=="2" (
    echo Running security scan...
    npm run security:scan
    pause
    goto SECURITY
)
if "%secchoice%"=="3" (
    echo Running security tests...
    npm run test:security
    pause
    goto SECURITY
)
if "%secchoice%"=="4" (
    echo Running full security check...
    npm run security:audit
    npm run security:scan
    npm run test:security
    echo Security check completed.
    pause
    goto SECURITY
)
if "%secchoice%"=="0" goto MAIN
goto SECURITY

:UTILS
cls
echo.
echo ====== UTILITIES MENU ======
echo.
echo [1] Claude Helper (npm run claude)
echo [2] Quick Claude (npm run claude:quick)
echo [3] Context Generator (npm run claude:context)
echo [4] Project Status
echo [5] Package Info
echo [6] Clean All (node_modules, .next, out)
echo [7] Fresh Install
echo [0] Back to Main Menu
echo.
set /p utilchoice="Enter your choice: "

if "%utilchoice%"=="1" (
    echo Starting Claude helper...
    npm run claude
    pause
    goto UTILS
)
if "%utilchoice%"=="2" (
    echo Running quick Claude...
    npm run claude:quick
    pause
    goto UTILS
)
if "%utilchoice%"=="3" (
    echo Generating context...
    npm run claude:context
    pause
    goto UTILS
)
if "%utilchoice%"=="4" (
    echo Project Status:
    echo.
    git status --porcelain
    echo.
    if exist "package.json" (
        echo Node.js version:
        node --version
        echo NPM version:
        npm --version
    )
    pause
    goto UTILS
)
if "%utilchoice%"=="5" (
    echo Package Information:
    echo.
    if exist "package.json" (
        type package.json | findstr "\"name\"\|\"version\"\|\"description\""
    )
    pause
    goto UTILS
)
if "%utilchoice%"=="6" (
    echo WARNING: This will delete node_modules, .next, and out directories
    set /p confirm="Are you sure? (y/N): "
    if /i "!confirm!"=="y" (
        echo Cleaning all directories...
        if exist "node_modules" rmdir /s /q "node_modules"
        if exist ".next" rmdir /s /q ".next"
        if exist "out" rmdir /s /q "out"
        echo Clean completed.
    )
    pause
    goto UTILS
)
if "%utilchoice%"=="7" (
    echo WARNING: This will delete node_modules and reinstall packages
    set /p confirm="Are you sure? (y/N): "
    if /i "!confirm!"=="y" (
        echo Performing fresh install...
        if exist "node_modules" rmdir /s /q "node_modules"
        npm install
        echo Fresh install completed.
    )
    pause
    goto UTILS
)
if "%utilchoice%"=="0" goto MAIN
goto UTILS

:GIT
cls
echo.
echo ====== GIT OPERATIONS MENU ======
echo.
echo [1] Git Status
echo [2] Git Add All
echo [3] Git Commit
echo [4] Git Push
echo [5] Git Pull
echo [6] Git Log (last 5)
echo [7] Git Branch Info
echo [8] Quick Commit & Push
echo [0] Back to Main Menu
echo.
set /p gitchoice="Enter your choice: "

if "%gitchoice%"=="1" (
    echo Git Status:
    git status
    pause
    goto GIT
)
if "%gitchoice%"=="2" (
    echo Adding all changes...
    git add .
    echo All changes added.
    pause
    goto GIT
)
if "%gitchoice%"=="3" (
    set /p commitmsg="Enter commit message: "
    if "!commitmsg!"=="" (
        echo Commit message cannot be empty.
    ) else (
        git commit -m "!commitmsg!"
        echo Committed with message: !commitmsg!
    )
    pause
    goto GIT
)
if "%gitchoice%"=="4" (
    echo Pushing to remote...
    git push
    pause
    goto GIT
)
if "%gitchoice%"=="5" (
    echo Pulling from remote...
    git pull
    pause
    goto GIT
)
if "%gitchoice%"=="6" (
    echo Last 5 commits:
    git log --oneline -5
    pause
    goto GIT
)
if "%gitchoice%"=="7" (
    echo Branch Information:
    echo Current branch:
    git branch --show-current
    echo All branches:
    git branch -a
    pause
    goto GIT
)
if "%gitchoice%"=="8" (
    set /p quickmsg="Enter commit message: "
    if "!quickmsg!"=="" (
        echo Commit message cannot be empty.
    ) else (
        echo Quick commit and push...
        git add .
        git commit -m "!quickmsg!"
        git push
        echo Quick commit and push completed.
    )
    pause
    goto GIT
)
if "%gitchoice%"=="0" goto MAIN
goto GIT

:HELP
cls
echo.
echo ====== HELP & INFORMATION ======
echo.
echo This master controller provides access to all project operations:
echo.
echo DEVELOPMENT: Start/stop dev servers, view in browser
echo TESTING: Comprehensive test suites (unit, e2e, a11y, performance)
echo BUILD ^& DEPLOY: Production builds, Firebase deployment, local serving
echo CODE QUALITY: Linting, type checking, automated fixes
echo SECURITY: Audits, scans, security tests
echo UTILITIES: Claude helpers, project status, maintenance
echo GIT OPERATIONS: Standard git workflow commands
echo.
echo Project Structure:
echo - Next.js 15.4.5 with App Router
echo - React 18.3.1 with TypeScript 5
echo - Tailwind CSS v4 with PostCSS
echo - Firebase hosting configured
echo - Comprehensive testing with Jest and Playwright
echo.
echo Key Features:
echo - Static export for Firebase hosting
echo - 70%% test coverage requirement
echo - WCAG accessibility compliance
echo - Performance monitoring
echo - Security scanning
echo.
echo For Claude Code assistance: npm run claude
echo For quick reference: npm run claude:quick
echo.
pause
goto MAIN

:INVALID
cls
echo.
echo Invalid choice! Please select a number between 0-8.
echo.
timeout /t 2 > nul
goto MAIN

:QUICK_DEV
echo Starting development server...
start /B npm run dev
echo Development server starting at http://localhost:3000
timeout /t 3 > nul
start http://localhost:3000
goto MAIN

:QUICK_TEST
echo Running all tests...
npm run test:all
pause
goto MAIN

:QUICK_BUILD
echo Building for production...
npm run build
echo Build completed.
pause
goto MAIN

:QUICK_LINT
echo Running lint check...
npm run lint
pause
goto MAIN

:QUICK_SECURITY
echo Running security audit...
npm run security:audit
pause
goto MAIN

:QUICK_STATUS
echo Project Status:
echo.
git status --porcelain
echo.
if exist "package.json" (
    echo Node.js: 
    node --version
    echo NPM: 
    npm --version
)
pause
goto MAIN

:QUICK_GIT
echo Git Status:
git status
pause
goto MAIN

:QUICK_CLAUDE
echo Starting Claude helper...
npm run claude:quick
pause
goto MAIN

:QUICK_EXIT
echo Goodbye!
timeout /t 1 > nul
exit /b 0

:EXIT
cls
echo.
echo Thank you for using Master Controller!
echo Shivam Bhardwaj Portfolio - Development Complete
echo.
timeout /t 2 > nul
exit /b 0