@echo off
setlocal enabledelayedexpansion

REM Custom Domain Setup Script for shivambhardwaj.com (Windows)
REM Configures App Engine custom domain mapping and SSL certificates

REM Configuration
set "PROJECT_ID=%GCP_PROJECT_ID%"
if "%PROJECT_ID%"=="" set "PROJECT_ID=shivambhardwaj-portfolio"

set "DOMAIN=%CUSTOM_DOMAIN%"
if "%DOMAIN%"=="" set "DOMAIN=shivambhardwaj.com"

set "SUBDOMAIN=%SUBDOMAIN%"
if "%SUBDOMAIN%"=="" set "SUBDOMAIN=www.shivambhardwaj.com"

echo.
echo ==========================================
echo   Custom Domain Setup - Windows
echo ==========================================
echo   Project: %PROJECT_ID%
echo   Domain: %DOMAIN%
echo   Subdomain: %SUBDOMAIN%
echo ==========================================
echo.

REM Check prerequisites
call :check_prerequisites
if errorlevel 1 goto :error

REM Verify domain ownership
call :verify_domain_ownership
if errorlevel 1 goto :error

REM Create domain mappings
call :create_domain_mappings
if errorlevel 1 goto :error

REM Show DNS configuration
call :show_dns_configuration

REM Generate report
call :generate_report

echo.
echo [SUCCESS] Custom domain configuration completed!
echo.
echo ======================================
echo   IMPORTANT NEXT STEPS
echo ======================================
echo.
echo 1. Update DNS records in Cloudflare:
echo    - A records: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21
echo    - CNAME record: www -^> ghs.googlehosted.com
echo    - Set proxy status to "DNS only" (gray cloud)
echo.
echo 2. Wait for DNS propagation (5-15 minutes)
echo 3. Wait for SSL certificate (up to 24 hours)
echo 4. Test your domain: https://%DOMAIN%
echo.
echo Verification: %~dp0setup-custom-domain.bat verify
echo.

goto :eof

:check_prerequisites
echo [INFO] Checking prerequisites...

REM Check if gcloud is installed
gcloud version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] gcloud CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if authenticated
for /f "usebackq" %%i in (`gcloud auth list --filter=status:ACTIVE --format="value(account)" 2^>nul`) do set "AUTH_ACCOUNT=%%i"
if "%AUTH_ACCOUNT%"=="" (
    echo [ERROR] Not authenticated with gcloud. Run 'gcloud auth login' first.
    exit /b 1
)

REM Set project
gcloud config set project %PROJECT_ID% >nul 2>&1

REM Check if App Engine app exists
gcloud app describe >nul 2>&1
if errorlevel 1 (
    echo [ERROR] App Engine application not found. Deploy your application first.
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed
goto :eof

:verify_domain_ownership
echo [INFO] Verifying domain ownership for %DOMAIN%...

REM Check if domain is already verified
for /f "usebackq" %%i in (`gcloud domains list-user-verified --format="value(id)" 2^>nul`) do (
    if "%%i"=="%DOMAIN%" (
        echo [SUCCESS] Domain %DOMAIN% is already verified
        goto :eof
    )
)

echo [INFO] Domain verification required. Starting verification process...

REM Start domain verification
gcloud domains verify %DOMAIN% --quiet >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Automatic domain verification failed
    echo.
    echo Manual Domain Verification Required:
    echo 1. Go to: https://www.google.com/webmasters/verification/
    echo 2. Add and verify your domain: %DOMAIN%
    echo 3. Use one of these methods:
    echo    - Upload HTML file to your current website
    echo    - Add DNS TXT record
    echo    - Add HTML meta tag to your homepage
    echo 4. Run this script again after verification
    echo.
    exit /b 1
)

echo [SUCCESS] Domain verification completed
goto :eof

:create_domain_mappings
echo [INFO] Creating domain mappings...

REM Check if domain mapping already exists
for /f "usebackq" %%i in (`gcloud app domain-mappings list --format="value(id)" 2^>nul`) do (
    if "%%i"=="%DOMAIN%" (
        echo [INFO] Domain mapping for %DOMAIN% already exists
        goto :create_subdomain
    )
)

REM Create domain mapping
echo [INFO] Creating domain mapping for %DOMAIN%...
gcloud app domain-mappings create %DOMAIN% --certificate-management=AUTOMATIC --quiet
if errorlevel 1 (
    echo [ERROR] Failed to create domain mapping for %DOMAIN%
    exit /b 1
)

echo [SUCCESS] Domain mapping created for %DOMAIN%

:create_subdomain
REM Check if subdomain mapping already exists
for /f "usebackq" %%i in (`gcloud app domain-mappings list --format="value(id)" 2^>nul`) do (
    if "%%i"=="%SUBDOMAIN%" (
        echo [INFO] Domain mapping for %SUBDOMAIN% already exists
        goto :eof
    )
)

REM Create subdomain mapping
echo [INFO] Creating subdomain mapping for %SUBDOMAIN%...
gcloud app domain-mappings create %SUBDOMAIN% --certificate-management=AUTOMATIC --quiet
if errorlevel 1 (
    echo [WARNING] Failed to create subdomain mapping for %SUBDOMAIN%
) else (
    echo [SUCCESS] Subdomain mapping created for %SUBDOMAIN%
)

goto :eof

:show_dns_configuration
echo.
echo ======================================
echo   DNS CONFIGURATION REQUIRED
echo ======================================
echo.
echo Required DNS Records for %DOMAIN%:
echo.
echo Root Domain (%DOMAIN%):
echo   Type: A, Name: @, Value: 216.239.32.21
echo   Type: A, Name: @, Value: 216.239.34.21
echo   Type: A, Name: @, Value: 216.239.36.21
echo   Type: A, Name: @, Value: 216.239.38.21
echo.
echo Subdomain (%SUBDOMAIN%):
echo   Type: CNAME, Name: www, Value: ghs.googlehosted.com
echo.
echo ======================================
echo   CLOUDFLARE DNS SETUP INSTRUCTIONS
echo ======================================
echo.
echo 1. Log in to your Cloudflare dashboard
echo 2. Select your domain: %DOMAIN%
echo 3. Go to DNS settings
echo 4. Update/Add the DNS records shown above
echo 5. Set Proxy status to 'DNS only' (gray cloud)
echo 6. Wait for DNS propagation (5-15 minutes)
echo 7. Run verification: %~dp0setup-custom-domain.bat verify
echo.
goto :eof

:generate_report
echo [INFO] Generating custom domain setup report...

REM Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z"

REM Get app URL
for /f "usebackq" %%i in (`gcloud app describe --format="value(defaultHostname)" 2^>nul`) do set "APP_HOSTNAME=%%i"

(
echo # Custom Domain Setup Report
echo.
echo **Project**: %PROJECT_ID%
echo **Domain**: %DOMAIN%
echo **Subdomain**: %SUBDOMAIN%
echo **Setup Date**: %timestamp%
echo.
echo ## Configuration Summary
echo.
echo ### App Engine Application
echo - **Default URL**: https://!APP_HOSTNAME!
echo - **Custom Domain**: https://%DOMAIN%
echo - **Subdomain**: https://%SUBDOMAIN%
echo.
echo ### SSL Certificates
echo - **Management**: Automatic (Google-managed^)
echo - **Domains**: %DOMAIN%, %SUBDOMAIN%
echo - **Status**: Provisioning (may take up to 24 hours^)
echo.
echo ### DNS Configuration
echo The following DNS records should be configured in Cloudflare:
echo.
echo #### Root Domain (%DOMAIN%^)
echo - A @ 216.239.32.21
echo - A @ 216.239.34.21
echo - A @ 216.239.36.21
echo - A @ 216.239.38.21
echo.
echo #### Subdomain (%SUBDOMAIN%^)
echo - CNAME www ghs.googlehosted.com
echo.
echo ## Verification Commands
echo.
echo Test your domain setup:
echo.
echo ```batch
echo REM Check DNS resolution
echo nslookup %DOMAIN% 8.8.8.8
echo nslookup %SUBDOMAIN% 8.8.8.8
echo.
echo REM Test HTTPS access
echo curl -I https://%DOMAIN%
echo curl -I https://%SUBDOMAIN%
echo ```
echo.
echo ## Next Steps
echo.
echo 1. ✅ Custom domain configured
echo 2. ⏳ Update DNS records in Cloudflare
echo 3. ⏳ Wait for DNS propagation (5-15 minutes^)
echo 4. ⏳ Wait for SSL certificate provisioning (up to 24 hours^)
echo 5. 🔍 Test all endpoints and redirects
echo 6. 📊 Update monitoring to include custom domain
echo 7. 🚀 Announce the new domain!
echo.
echo ---
echo *Generated by custom domain setup script*
echo *Project: %PROJECT_ID%*
) > custom-domain-setup-report.md

echo [SUCCESS] Custom domain setup report generated: custom-domain-setup-report.md
goto :eof

:verify_dns_and_ssl
echo [INFO] Verifying DNS propagation and SSL setup...

REM Check DNS resolution
echo [INFO] Checking DNS resolution for %DOMAIN%...
nslookup %DOMAIN% 8.8.8.8 | findstr "Address" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] DNS resolution failed for %DOMAIN%
) else (
    echo [SUCCESS] DNS resolution working for %DOMAIN%
)

REM Test HTTPS access
echo [INFO] Testing HTTPS access...
curl -I https://%DOMAIN% --connect-timeout 10 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] HTTPS not yet available for %DOMAIN%
    echo [INFO] SSL certificates can take up to 24 hours to provision
) else (
    echo [SUCCESS] HTTPS access working for %DOMAIN%
)

curl -I https://%SUBDOMAIN% --connect-timeout 10 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] HTTPS not yet available for %SUBDOMAIN%
) else (
    echo [SUCCESS] HTTPS access working for %SUBDOMAIN%
)

goto :eof

:show_status
echo [INFO] Checking domain mapping status...
echo.
echo Domain Mappings:
gcloud app domain-mappings list
echo.
echo SSL Certificates:
gcloud app ssl-certificates list
goto :eof

:error
echo.
echo [ERROR] Custom domain setup failed!
echo Check the error messages above for details.
echo.
exit /b 1

REM Handle command line arguments
if "%1"=="verify" (
    call :verify_dns_and_ssl
    goto :eof
)

if "%1"=="status" (
    call :show_status
    goto :eof
)

if "%1"=="dns" (
    call :show_dns_configuration
    goto :eof
)

if "%1"=="help" (
    echo Usage: %~n0 [verify^|status^|dns^|help]
    echo.
    echo Commands:
    echo   verify  - Verify DNS and SSL setup
    echo   status  - Show current domain status
    echo   dns     - Show DNS configuration requirements
    echo   help    - Show this help message
    goto :eof
)

REM Default action is setup
goto :eof