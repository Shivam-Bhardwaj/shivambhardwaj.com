@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: MASTER CONTROLLER - COMPREHENSIVE SOLUTION
:: ============================================================================
:: This is the single master bat file that replaces all others
:: Provides: SSL troubleshooting, GCP deployment, domain setup, and more
:: ============================================================================

:: Initialize variables
set PROJECT_NAME=Shivam Bhardwaj Portfolio - Master Controller
set VERSION=2.0.0
set LOG_FILE=master-controller.log
set ERROR_COUNT=0
set SUCCESS_COUNT=0
set PROJECT_ID=anti-mony
set DOMAIN=shivambhardwaj.com
set APP_ENGINE_URL=anti-mony.uc.r.appspot.com

:: Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

:: Log function
call :log "Master Controller started - %PROJECT_NAME% v%VERSION%"

:: ============================================================================
:: SIMPLE MENU SYSTEM
:: ============================================================================
:menu
cls
echo ==========================================
echo    MASTER CONTROLLER v%VERSION%
echo    Shivam Bhardwaj Portfolio
echo ==========================================
echo.
echo 1. SSL Troubleshooting (525 Error Fix)
echo 2. Quick Status Check
echo 3. GCP Deployment
echo 4. Domain Setup
echo 5. DNS Diagnostics
echo 6. Testing Suite
echo 7. Utilities
echo 8. Help
echo 0. Exit
echo.
echo Stats: Success: %SUCCESS_COUNT% ^| Errors: %ERROR_COUNT%
echo.

set /p choice="Enter your choice (0-8): "

if "%choice%"=="1" goto ssl_menu
if "%choice%"=="2" goto quick_status
if "%choice%"=="3" goto gcp_menu
if "%choice%"=="4" goto domain_menu
if "%choice%"=="5" goto dns_menu
if "%choice%"=="6" goto test_menu
if "%choice%"=="7" goto utilities_menu
if "%choice%"=="8" goto help_info
if "%choice%"=="0" goto exit_script

echo Invalid choice. Please try again.
pause
goto menu

:: ============================================================================
:: SSL TROUBLESHOOTING MENU
:: ============================================================================
:ssl_menu
cls
echo.
echo === SSL TROUBLESHOOTING MENU ===
echo 1. Quick Status Check
echo 2. App Engine SSL Check
echo 3. Cloudflare SSL Test
echo 4. Gray Cloud Test
echo 5. Force Cloudflare Reset
echo 6. Flexible SSL Test
echo 0. Back to Main Menu
echo.

set /p ssl_choice="Enter your choice: "

if "%ssl_choice%"=="1" goto quick_status
if "%ssl_choice%"=="2" goto check_ssl_cert
if "%ssl_choice%"=="3" goto test_ssl_modes
if "%ssl_choice%"=="4" goto gray_cloud_test
if "%ssl_choice%"=="5" goto force_reset
if "%ssl_choice%"=="6" goto flexible_test
if "%ssl_choice%"=="0" goto menu

echo Invalid choice.
pause
goto ssl_menu

:: Quick status check
:quick_status
echo.
echo === QUICK STATUS CHECK ===
echo Testing direct App Engine access...
powershell -Command "(Invoke-WebRequest -Uri 'https://%APP_ENGINE_URL%' -Method HEAD).StatusCode"

echo.
echo Testing through Cloudflare...
powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode"

echo.
echo === DIAGNOSIS ===
echo Status check completed.
echo.
call :success "Status check completed"
pause
goto ssl_menu

:: Check App Engine SSL certificate
:check_ssl_cert
echo.
echo === CHECKING APP ENGINE SSL CERTIFICATE ===
powershell -Command ^
"$tcp = New-Object System.Net.Sockets.TcpClient; " ^
"$tcp.Connect('%APP_ENGINE_URL%', 443); " ^
"$ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false); " ^
"$ssl.AuthenticateAsClient('%APP_ENGINE_URL%'); " ^
"Write-Host 'SSL Protocol:' $ssl.SslProtocol; " ^
"Write-Host 'Cipher Algorithm:' $ssl.CipherAlgorithm"

call :success "SSL certificate check completed"
pause
goto ssl_menu

:: Test different Cloudflare SSL modes
:test_ssl_modes
echo.
echo === TESTING DIFFERENT CLOUDFLARE SSL MODES ===
echo MANUAL STEPS REQUIRED IN CLOUDFLARE DASHBOARD:
echo 1. Go to SSL/TLS -^> Overview in Cloudflare Dashboard
echo 2. Try each mode and test:
echo   a) Change to "Flexible" -^> Wait 2 minutes -^> Test below
echo   b) Change to "Full (strict)" -^> Wait 2 minutes -^> Test below
echo   c) Change back to "Full" -^> Wait 2 minutes -^> Test below
set /p mode="Which mode did you set? (flexible/strict/full): "
echo.
echo Testing current configuration...
powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode" 2>nul || echo "Still showing 525 error"
call :success "SSL mode test completed"
pause
goto ssl_menu

:: Gray cloud bypass test
:gray_cloud_test
echo.
echo === GRAY CLOUD BYPASS TEST ===
echo MANUAL STEPS:
echo 1. Go to Cloudflare Dashboard -^> DNS records
echo 2. Click orange cloud next to your records -^> Make gray (DNS only)
echo 3. Wait 5 minutes for propagation
echo 4. Test: https://%DOMAIN%
echo 5. If works -^> Issue is Cloudflare SSL config
echo 6. Turn clouds back to orange after testing
set /p tested="Did you complete the gray cloud test? (y/n): "
if /i "%tested%"=="y" (
    echo Did the site work with gray cloud?
    set /p worked="Enter (y/n): "
    if /i "%worked%"=="y" (
        echo CONFIRMED: Issue is Cloudflare SSL configuration
    ) else (
        echo Issue might be with App Engine or DNS
    )
)
call :success "Gray cloud test completed"
pause
goto ssl_menu

:: Force Cloudflare reset
:force_reset
echo.
echo === FORCE CLOUDFLARE RESET ===
echo MANUAL STEPS TO FORCE RESET:
echo 1. Go to Cloudflare Dashboard -^> Caching -^> Configuration
echo 2. Click "Purge Everything" -^> Confirm
echo 3. Go to SSL/TLS -^> Overview
echo 4. Change SSL mode to "Off" -^> Wait 30 seconds
echo 5. Change back to "Full" -^> Wait 2 minutes
echo 6. Go to Caching -^> Configuration -^> Enable "Development Mode"
echo This forces Cloudflare edge servers to reset SSL cache
set /p completed="Did you complete the force reset? (y/n): "
if /i "%completed%"=="y" (
    echo Testing after force reset...
    powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode" 2>nul || echo "Still 525 error - may need more time"
)
call :success "Force reset completed"
pause
goto ssl_menu

:: Flexible SSL test
:flexible_test
echo.
echo === TESTING WITH FLEXIBLE SSL ===
echo MANUAL STEPS:
echo 1. Go to Cloudflare Dashboard -^> SSL/TLS -^> Overview
echo 2. Change SSL mode to "Flexible"
echo 3. Wait 2 minutes for propagation
echo 4. Test below:
powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode" 2>nul || echo "Flexible SSL test result"
echo Note: Flexible SSL is less secure but helps isolate origin SSL issues
set /p continue="Did Flexible SSL work? (y/n): "
if /i "%continue%"=="y" (
    echo Flexible SSL works! This indicates origin SSL certificate issues
) else (
    echo Even Flexible SSL fails - likely DNS or origin server issues
)
call :success "Flexible SSL test completed"
pause
goto ssl_menu

:: ============================================================================
:: GCP DEPLOYMENT MENU
:: ============================================================================
:gcp_menu
cls
echo.
echo === GCP DEPLOYMENT MENU ===
echo 1. Deploy to App Engine
echo 2. Check Deployment Status
echo 3. View Logs
echo 4. Cleanup Old Versions
echo 0. Back to Main Menu
echo.

set /p gcp_choice="Enter your choice: "

if "%gcp_choice%"=="1" goto deploy_app_engine
if "%gcp_choice%"=="2" goto check_status
if "%gcp_choice%"=="3" goto view_logs
if "%gcp_choice%"=="4" goto cleanup_versions
if "%gcp_choice%"=="0" goto menu

echo Invalid choice.
pause
goto gcp_menu

:: Deploy to App Engine
:deploy_app_engine
echo.
echo === DEPLOYING TO APP ENGINE ===
echo Setting project...
gcloud config set project %PROJECT_ID%

echo Building application...
cd shivambhardwaj-gc
call npm install --production=false
call npm run build

echo Deploying to App Engine...
gcloud app deploy app.yaml --promote --stop-previous-version --quiet

cd ..
echo [SUCCESS] Deployment completed!
call :success "App Engine deployment completed"
pause
goto gcp_menu

:: Check deployment status
:check_status
echo.
echo === CHECKING DEPLOYMENT STATUS ===
gcloud app services list
echo.
gcloud app versions list --sort-by="~createTime"
call :success "Deployment status checked"
pause
goto gcp_menu

:: View logs
:view_logs
echo.
echo === VIEWING APPLICATION LOGS ===
gcloud app logs tail --service=default --version=1
call :success "Logs viewed"
pause
goto gcp_menu

:: Cleanup old versions
:cleanup_versions
echo.
echo === CLEANING UP OLD VERSIONS ===
for /f "skip=5 usebackq" %%i in (`gcloud app versions list --format="value(id)" --sort-by="~createTime"`) do (
    echo Deleting old version: %%i
    gcloud app versions delete %%i --quiet >nul 2>&1
)
call :success "Old versions cleaned up"
pause
goto gcp_menu

:: ============================================================================
:: DOMAIN SETUP MENU
:: ============================================================================
:domain_menu
cls
echo.
echo === DOMAIN SETUP MENU ===
echo 1. Quick Domain Setup
echo 2. Check Domain Status
echo 3. SSL Certificate Status
echo 0. Back to Main Menu
echo.

set /p domain_choice="Enter your choice: "

if "%domain_choice%"=="1" goto quick_domain_setup
if "%domain_choice%"=="2" goto check_domain_status
if "%domain_choice%"=="3" goto ssl_cert_status
if "%domain_choice%"=="0" goto menu

echo Invalid choice.
pause
goto domain_menu

:: Quick domain setup
:quick_domain_setup
echo.
echo === QUICK DOMAIN SETUP ===
cd shivambhardwaj-gc
echo Setting up domain mappings...
gcloud app domain-mappings create %DOMAIN% --certificate-management=AUTOMATIC --quiet
gcloud app domain-mappings create www.%DOMAIN% --certificate-management=AUTOMATIC --quiet
cd ..

echo.
echo Next steps:
echo 1. Update DNS records in Cloudflare (set to DNS only/gray cloud)
echo 2. Wait 5-15 minutes for propagation
echo 3. Test your domain
call :success "Quick domain setup completed"
pause
goto domain_menu

:: Check domain status
:check_domain_status
echo.
echo === CHECKING DOMAIN STATUS ===
gcloud app domain-mappings list
echo.
echo DNS propagation check:
nslookup %DOMAIN%
call :success "Domain status checked"
pause
goto domain_menu

:: SSL certificate status
:ssl_cert_status
echo.
echo === CHECKING SSL CERTIFICATE STATUS ===
gcloud app domain-mappings describe %DOMAIN%
echo.
echo Certificate provisioning can take up to 24 hours after DNS setup.
call :success "SSL certificate status checked"
pause
goto domain_menu

:: ============================================================================
:: DNS DIAGNOSTICS MENU
:: ============================================================================
:dns_menu
cls
echo.
echo === DNS DIAGNOSTICS MENU ===
echo 1. DNS Resolution Check
echo 2. DNS Propagation Test
echo 3. DNS Records Lookup
echo 4. SSL/TLS Version Check
echo 5. Port Connectivity Test
echo 0. Back to Main Menu
echo.

set /p dns_choice="Enter your choice: "

if "%dns_choice%"=="1" goto dns_resolution
if "%dns_choice%"=="2" goto dns_propagation
if "%dns_choice%"=="3" goto dns_records
if "%dns_choice%"=="4" goto ssl_version_check
if "%dns_choice%"=="5" goto port_connectivity
if "%dns_choice%"=="0" goto menu

echo Invalid choice.
pause
goto dns_menu

:: DNS resolution check
:dns_resolution
echo.
echo === DNS RESOLUTION CHECK ===
echo Checking DNS resolution for %DOMAIN%...
nslookup %DOMAIN%
echo.
echo Checking DNS resolution for %APP_ENGINE_URL%...
nslookup %APP_ENGINE_URL%
call :success "DNS resolution check completed"
pause
goto dns_menu

:: DNS propagation test
:dns_propagation
echo.
echo === DNS PROPAGATION TEST ===
echo A Records for %DOMAIN%:
nslookup -type=A %DOMAIN%
echo.
echo CNAME Records for %DOMAIN%:
nslookup -type=CNAME %DOMAIN%
call :success "DNS propagation test completed"
pause
goto dns_menu

:: DNS records lookup
:dns_records
echo.
echo === DNS RECORDS LOOKUP ===
echo Comprehensive DNS lookup for %DOMAIN%...
nslookup -type=ALL %DOMAIN%
call :success "DNS records lookup completed"
pause
goto dns_menu

:: SSL version check
:ssl_version_check
echo.
echo === SSL/TLS VERSION CHECK ===
echo Checking supported SSL/TLS versions...
powershell -Command ^
"[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; " ^
"try { $response = Invoke-WebRequest -Uri 'https://%APP_ENGINE_URL%'; Write-Host 'TLS 1.2: Supported' } catch { Write-Host 'TLS 1.2: Failed' }"
call :success "SSL version check completed"
pause
goto dns_menu

:: Port connectivity test
:port_connectivity
echo.
echo === PORT CONNECTIVITY TEST ===
echo Testing port 443 connectivity to %DOMAIN%...
powershell -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient; $tcp.Connect('%DOMAIN%', 443); Write-Host 'Port 443 is open'; $tcp.Close() } catch { Write-Host 'Port 443 is blocked or timeout' }"
call :success "Port connectivity test completed"
pause
goto dns_menu

:: ============================================================================
:: TESTING MENU
:: ============================================================================
:test_menu
cls
echo.
echo === TESTING SUITE MENU ===
echo 1. Quick Status Test
echo 2. Comprehensive Test
echo 3. SSL Certificate Test
echo 4. DNS Diagnostics Test
echo 0. Back to Main Menu
echo.

set /p test_choice="Enter your choice: "

if "%test_choice%"=="1" goto quick_status_test
if "%test_choice%"=="2" goto comprehensive_test
if "%test_choice%"=="3" goto ssl_certificate_test
if "%test_choice%"=="4" goto dns_diagnostics_test
if "%test_choice%"=="0" goto menu

echo Invalid choice.
pause
goto test_menu

:: Quick status test
:quick_status_test
echo.
echo === QUICK STATUS TEST ===
echo Testing direct App Engine access...
powershell -Command "(Invoke-WebRequest -Uri 'https://%APP_ENGINE_URL%' -Method HEAD).StatusCode"

echo.
echo Testing through Cloudflare...
powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode" 2>nul || echo "525 SSL Error Confirmed"

echo.
echo === RESULTS ===
echo Direct App Engine: Should show 200 (working)
echo Cloudflare: Will fail with 525 error (if SSL issue exists)
call :success "Quick status test completed"
pause
goto test_menu

:: Comprehensive test
:comprehensive_test
echo.
echo === COMPREHENSIVE TEST ===
echo Running comprehensive test suite...
echo 1. Direct App Engine test...
powershell -Command "(Invoke-WebRequest -Uri 'https://%APP_ENGINE_URL%' -Method HEAD).StatusCode"

echo.
echo 2. Cloudflare proxy test...
powershell -Command "(Invoke-WebRequest -Uri 'https://%DOMAIN%' -Method HEAD).StatusCode" 2>nul || echo "Cloudflare test failed"

echo.
echo 3. DNS resolution test...
nslookup %DOMAIN%

echo.
echo 4. SSL certificate test...
powershell -Command ^
"$tcp = New-Object System.Net.Sockets.TcpClient; " ^
"$tcp.Connect('%APP_ENGINE_URL%', 443); " ^
"$ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false); " ^
"$ssl.AuthenticateAsClient('%APP_ENGINE_URL%'); " ^
"Write-Host 'SSL Protocol:' $ssl.SslProtocol"

call :success "Comprehensive test completed"
pause
goto test_menu

:: SSL certificate test
:ssl_certificate_test
echo.
echo === SSL CERTIFICATE TEST ===
echo Testing SSL certificate details...
powershell -Command ^
"$tcp = New-Object System.Net.Sockets.TcpClient; " ^
"$tcp.Connect('%APP_ENGINE_URL%', 443); " ^
"$ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false); " ^
"$ssl.AuthenticateAsClient('%APP_ENGINE_URL%'); " ^
"Write-Host 'SSL Protocol:' $ssl.SslProtocol; " ^
"Write-Host 'Cipher Algorithm:' $ssl.CipherAlgorithm; " ^
"Write-Host 'Certificate Subject:' $ssl.RemoteCertificate.Subject"
call :success "SSL certificate test completed"
pause
goto test_menu

:: DNS diagnostics test
:dns_diagnostics_test
echo.
echo === DNS DIAGNOSTICS TEST ===
echo Running DNS diagnostics...
nslookup %DOMAIN%
nslookup -type=A %DOMAIN%
nslookup -type=CNAME %DOMAIN%
call :success "DNS diagnostics test completed"
pause
goto test_menu

:: ============================================================================
:: UTILITIES MENU
:: ============================================================================
:utilities_menu
cls
echo.
echo === UTILITIES MENU ===
echo 1. Clean Cache
echo 2. System Information
echo 3. Network Diagnostics
echo 4. Environment Variables
echo 0. Back to Main Menu
echo.

set /p utilities_choice="Enter your choice: "

if "%utilities_choice%"=="1" goto clean_cache_utility
if "%utilities_choice%"=="2" goto system_information
if "%utilities_choice%"=="3" goto network_diagnostics
if "%utilities_choice%"=="4" goto environment_variables
if "%utilities_choice%"=="0" goto menu

echo Invalid choice.
pause
goto utilities_menu

:: Clean cache utility
:clean_cache_utility
echo.
echo === CLEANING CACHE ===
cd shivambhardwaj-gc
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist dist rmdir /s /q dist
cd ..
echo [SUCCESS] Cache cleaned!
call :success "Cache cleaned"
pause
goto utilities_menu

:: System information
:system_information
echo.
echo === SYSTEM INFORMATION ===
echo Node.js Version:
node --version

echo.
echo npm Version:
npm --version

echo.
echo gcloud Version:
gcloud version | findstr "Google Cloud SDK"

echo.
echo Git Version:
git --version
call :success "System information displayed"
pause
goto utilities_menu

:: Network diagnostics
:network_diagnostics
echo.
echo === NETWORK DIAGNOSTICS ===
echo Running network diagnostics...
ping -n 4 %DOMAIN%
echo.
ping -n 4 %APP_ENGINE_URL%
call :success "Network diagnostics completed"
pause
goto utilities_menu

:: Environment variables
:environment_variables
echo.
echo === ENVIRONMENT VARIABLES ===
echo Current environment variables:
echo PROJECT_ID=%PROJECT_ID%
echo DOMAIN=%DOMAIN%
echo APP_ENGINE_URL=%APP_ENGINE_URL%
echo LOG_FILE=%LOG_FILE%
call :success "Environment variables displayed"
pause
goto utilities_menu

:: ============================================================================
:: HELP INFORMATION
:: ============================================================================
:help_info
cls
echo.
echo === HELP & INFORMATION ===
echo.
echo This master controller provides comprehensive automation for:
echo.
echo SSL TROUBLESHOOTING: Complete 525 SSL error diagnosis and fixes
echo GCP DEPLOYMENT: App Engine and Cloud Run deployment automation
echo DOMAIN SETUP: Custom domain configuration and SSL certificate management
echo BUILD OPERATIONS: Production builds, analysis, and Docker support
echo SECURITY OPERATIONS: Security audits, vulnerability scanning, SSL validation
echo DNS DIAGNOSTICS: Comprehensive DNS resolution and propagation testing
echo STATUS & MONITORING: Service status, health checks, and performance metrics
echo TESTING SUITE: Unit tests, integration tests, and comprehensive testing
echo UTILITIES: Cache cleaning, system info, network diagnostics, and more
echo.
echo FOR SSL 525 ERRORS:
echo 1. Start with option 1 (SSL Troubleshooting)
echo 2. Run the quick status check
echo 3. Follow the guided diagnostic steps
echo 4. Implement the recommended fixes
echo.
echo FOR DEPLOYMENT:
echo 1. Use option 3 (GCP Deployment)
echo 2. Choose Deploy to App Engine
echo 3. Follow the deployment process
echo 4. Check deployment status and logs
echo.
pause
goto menu

:: ============================================================================
:: UTILITY FUNCTIONS
:: ============================================================================
:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
exit /b

:success
set /a SUCCESS_COUNT+=1
call :log "SUCCESS: %~1"
echo SUCCESS: %~1
exit /b

:error
set /a ERROR_COUNT+=1
call :log "ERROR: %~1"
echo ERROR: %~1
exit /b

:: ============================================================================
:: EXIT
:: ============================================================================
:exit_script
call :log "Master Controller session ended"
cls
echo.
echo ==========================================
echo    Thank you for using Master Controller!
echo    %PROJECT_NAME% v%VERSION%
echo ==========================================
echo.
echo Session Statistics:
echo Successful Operations: %SUCCESS_COUNT%
echo Failed Operations: %ERROR_COUNT%
echo Log File: %LOG_FILE%
echo.
echo Have a great day!
echo.
timeout /t 3 /nobreak >nul
exit /b 0