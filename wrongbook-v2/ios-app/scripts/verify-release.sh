#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUNDLE_ID="${WRONGBOOK_BUNDLE_ID:-com.searchrecall.wrongbook}"
PLIST="ios/App/App/Info.plist"
PBX="ios/App/App.xcodeproj/project.pbxproj"

[[ -f www/index.html ]] || { echo "Missing staged www/index.html" >&2; exit 1; }
[[ -f "$PLIST" ]] || { echo "Missing iOS Info.plist" >&2; exit 1; }
[[ -f "$PBX" ]] || { echo "Missing Xcode project" >&2; exit 1; }
[[ -f ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png ]] || { echo "Missing 1024px App Store icon" >&2; exit 1; }

if grep -q '../wrongbook-prototype/' www/index.html; then
  echo "Native bundle still points outside wrongbook-v2." >&2
  exit 1
fi
if grep -q '"url"[[:space:]]*:' capacitor.config.json; then
  echo "capacitor.config.json must not use server.url for production/TestFlight." >&2
  exit 1
fi
if ! grep -q "PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID;" "$PBX"; then
  echo "Bundle identifier is not configured as $BUNDLE_ID." >&2
  exit 1
fi

/usr/libexec/PlistBuddy -c 'Print :NSCameraUsageDescription' "$PLIST" >/dev/null
/usr/libexec/PlistBuddy -c 'Print :NSPhotoLibraryUsageDescription' "$PLIST" >/dev/null
/usr/libexec/PlistBuddy -c 'Print :CFBundleDisplayName' "$PLIST" >/dev/null

WORKSPACE="ios/App/App.xcworkspace"
PROJECT="ios/App/App.xcodeproj"
if [[ -d "$WORKSPACE" ]]; then
  xcodebuild -workspace "$WORKSPACE" -scheme App -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
else
  xcodebuild -project "$PROJECT" -scheme App -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
fi

printf '\nRelease verification passed. The unsigned Release target builds successfully.\n'
