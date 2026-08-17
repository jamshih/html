#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUNDLE_ID="${WRONGBOOK_BUNDLE_ID:-com.searchrecall.wrongbook}"
APP_NAME="${WRONGBOOK_APP_NAME:-錯題本}"
MARKETING_VERSION="${WRONGBOOK_VERSION:-0.1.0}"
BUILD_NUMBER="${WRONGBOOK_BUILD_NUMBER:-1}"
PLIST="ios/App/App/Info.plist"
PBX="ios/App/App.xcodeproj/project.pbxproj"

[[ -f "$PLIST" ]] || { echo "Missing $PLIST. Run npx cap add ios first." >&2; exit 1; }
[[ -f "$PBX" ]] || { echo "Missing $PBX." >&2; exit 1; }

set_plist_string() {
  local key="$1" value="$2"
  /usr/libexec/PlistBuddy -c "Delete :$key" "$PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :$key string $value" "$PLIST"
}

set_plist_string CFBundleDisplayName "$APP_NAME"
set_plist_string NSCameraUsageDescription "用來拍攝題目與作答內容，整理成你的錯題。"
set_plist_string NSPhotoLibraryUsageDescription "用來選擇已有的題目照片並加入錯題本。"

BUNDLE_ID="$BUNDLE_ID" MARKETING_VERSION="$MARKETING_VERSION" BUILD_NUMBER="$BUILD_NUMBER" perl -0pi -e '
  s/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/PRODUCT_BUNDLE_IDENTIFIER = $ENV{BUNDLE_ID};/g;
  s/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = $ENV{MARKETING_VERSION};/g;
  s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = $ENV{BUILD_NUMBER};/g;
' "$PBX"

if [[ -n "${APPLE_DEVELOPMENT_TEAM:-}" ]]; then
  TEAM="$APPLE_DEVELOPMENT_TEAM" perl -0pi -e '
    if (/DEVELOPMENT_TEAM = /) { s/DEVELOPMENT_TEAM = [^;]*;/DEVELOPMENT_TEAM = $ENV{TEAM};/g }
  ' "$PBX"
fi

printf 'Configured iOS target: %s (%s) version %s build %s\n' "$APP_NAME" "$BUNDLE_ID" "$MARKETING_VERSION" "$BUILD_NUMBER"
