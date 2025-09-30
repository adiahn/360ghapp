@echo off
echo Setting up EAS Build for 360gh App
echo ===================================
echo.

echo Step 1: Checking EAS CLI...
npx eas --version

echo.
echo Step 2: Checking login status...
npx eas whoami

echo.
echo Step 3: You need to run the following commands manually:
echo.
echo 1. First, run: eas init
echo    - Answer "Y" when asked to create a project
echo.
echo 2. Then run: eas build --platform android --profile preview
echo    - This will build your APK in the cloud
echo.
echo 3. Download the APK from the link provided when build completes
echo.

echo Your app is ready to build with the following features:
echo - Biometric Authentication (Face ID on iOS, Biometrics on Android)
echo - Memo Management System
echo - Contact Management
echo - Secure Action Modals
echo - Settings Screen
echo.

pause
