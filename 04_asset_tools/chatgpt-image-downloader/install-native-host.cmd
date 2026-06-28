@echo off
setlocal

if "%~1"=="" (
  echo Usage:
  echo   install-native-host.cmd EXTENSION_ID
  echo.
  echo Example:
  echo   install-native-host.cmd abcdefghijklmnopqrstuvwxyzabcdef
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-native-host.ps1" -ExtensionId "%~1"
