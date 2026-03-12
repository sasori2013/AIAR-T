# AIAR-T: Image Target Update Script
# This script automates 'npx @8thwall/image-target-cli' by piping answers to interactive prompts.

$targetImage = "img/logo-target_original.png"
$targetName = "logo-target"

if (!(Test-Path $targetImage)) {
    Write-Error "Source image not found: $targetImage"
    exit 1
}

Write-Host "Generating target data for $targetName..."

# Prompts and answers (Piped):
# 1. Image path: img/logo-target_original.png
# 2. Crop (Enter for default)
# 3. Target name: logo-target
# 4. Mode (Enter for Flat)
$inputStrings = @(
    $targetImage,
    "",
    $targetName,
    ""
) -join "`n"

$inputStrings | npx @8thwall/image-target-cli

# Copy metadata to logo.json for easy fetching
if (Test-Path "$targetName/$targetName.json") {
    Copy-Item -Path "$targetName/$targetName.json" -Destination "targets/logo.json" -Force
    Write-Host "AIAR-T: Target data updated at targets/logo.json"
} else {
    Write-Warning "Metatdata file not found at $targetName/$targetName.json"
}
