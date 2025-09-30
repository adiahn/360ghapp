@echo off
echo Building APK for 360gh App...
echo.

echo Step 1: Initializing EAS project...
echo Y | npx eas init

echo.
echo Step 2: Building APK...
npx eas build --platform android --profile preview

echo.
echo Build process completed!
pause
