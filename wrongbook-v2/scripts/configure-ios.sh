#!/usr/bin/env bash
set -euo pipefail

PLIST="ios/App/App/Info.plist"

if [[ ! -f "$PLIST" ]]; then
  echo "Missing $PLIST. Run 'npm run ios:add' first." >&2
  exit 1
fi

set_string() {
  local key="$1"
  local value="$2"
  if /usr/libexec/PlistBuddy -c "Print :${key}" "$PLIST" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Set :${key} ${value}" "$PLIST"
  else
    /usr/libexec/PlistBuddy -c "Add :${key} string ${value}" "$PLIST"
  fi
}

set_string "NSCameraUsageDescription" "錯題本需要使用相機拍攝題目與手寫訂正。"
set_string "NSPhotoLibraryUsageDescription" "錯題本需要讀取你選擇的題目與筆記圖片。"

printf 'Configured iOS camera and photo-library permission descriptions.\n'
