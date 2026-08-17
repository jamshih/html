#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p build
ARCHIVE_PATH="$ROOT/build/WrongBook.xcarchive"
rm -rf "$ARCHIVE_PATH"

ARGS=(-scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$ARCHIVE_PATH" archive -allowProvisioningUpdates)
if [[ -d ios/App/App.xcworkspace ]]; then
  xcodebuild -workspace ios/App/App.xcworkspace "${ARGS[@]}"
else
  xcodebuild -project ios/App/App.xcodeproj "${ARGS[@]}"
fi

printf '\nArchive created: %s\nOpen Xcode Organizer and choose Distribute App > TestFlight & App Store.\n' "$ARCHIVE_PATH"
open "$ARCHIVE_PATH"
