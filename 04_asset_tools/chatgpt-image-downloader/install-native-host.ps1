param(
  [Parameter(Mandatory = $true)]
  [string]$ExtensionId
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostCmd = Join-Path $root "native-host\chatgpt_image_downloader_host.cmd"
$manifestPath = Join-Path $root "native-host\com.local.chatgpt_image_downloader.json"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found on PATH. Install Node.js or add it to PATH, then run this script again."
}

if (-not (Test-Path $hostCmd)) {
  throw "Native host command was not found: $hostCmd"
}

$manifest = [ordered]@{
  name = "com.local.chatgpt_image_downloader"
  description = "Local writer for ChatGPT Image Batch Downloader"
  path = $hostCmd
  type = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $manifestPath

$keyPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.local.chatgpt_image_downloader"
New-Item -Force -Path $keyPath | Out-Null
Set-Item -Path $keyPath -Value $manifestPath

Write-Host "Native host registered."
Write-Host "Manifest: $manifestPath"
Write-Host "Allowed extension: $ExtensionId"
