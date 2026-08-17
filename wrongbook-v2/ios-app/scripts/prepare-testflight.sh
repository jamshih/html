#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

export WRONGBOOK_BUNDLE_ID="${WRONGBOOK_BUNDLE_ID:-com.searchrecall.wrongbook}"
export WRONGBOOK_APP_NAME="${WRONGBOOK_APP_NAME:-錯題本}"
export WRONGBOOK_VERSION="${WRONGBOOK_VERSION:-0.1.0}"
if [[ -z "${WRONGBOOK_BUILD_NUMBER:-}" ]]; then
  WRONGBOOK_BUILD_NUMBER="$(git -C "$REPO_ROOT" rev-list --count HEAD 2>/dev/null || echo 1)"
  export WRONGBOOK_BUILD_NUMBER
fi

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "TestFlight preparation must run on macOS." >&2
  exit 1
fi

command -v node >/dev/null || { echo "Node.js 22+ is required." >&2; exit 1; }
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 22 )); then
  echo "Node.js 22+ is required; found $(node --version)." >&2
  exit 1
fi

command -v swift >/dev/null || { echo "Swift is required to render the native app icon." >&2; exit 1; }
command -v xcodebuild >/dev/null || { echo "Xcode 26+ is required." >&2; exit 1; }
XCODE_VERSION="$(xcodebuild -version | awk '/Xcode/{print $2; exit}')"
XCODE_MAJOR="${XCODE_VERSION%%.*}"
if [[ -z "$XCODE_MAJOR" || "$XCODE_MAJOR" -lt 26 ]]; then
  echo "Xcode 26+ is required for current App Store Connect uploads; found Xcode $XCODE_VERSION." >&2
  echo "If Xcode 26 is installed but not selected, run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" >&2
  exit 1
fi

printf 'Preparing %s for TestFlight\n  bundle: %s\n  version: %s (%s)\n  Xcode: %s\n' \
  "$WRONGBOOK_APP_NAME" "$WRONGBOOK_BUNDLE_ID" "$WRONGBOOK_VERSION" "$WRONGBOOK_BUILD_NUMBER" "$XCODE_VERSION"

npm install --no-audit --no-fund
node scripts/write-capacitor-config.mjs
swift scripts/render-icon.swift assets/app-icon-1024.png
npm run web:stage

if [[ ! -d ios/App ]]; then
  npx cap add ios
fi
npx cap sync ios

bash scripts/configure-ios.sh
bash scripts/generate-icons.sh
bash scripts/verify-release.sh

cat <<EOF

TestFlight project is prepared.

Next in Xcode:
  1. npm run ios:open
  2. Select target App > Signing & Capabilities > your Apple Developer Team.
  3. Confirm bundle identifier: $WRONGBOOK_BUNDLE_ID
  4. Run once on a real iPhone and verify camera/photo access plus AI calls.
  5. Choose Any iOS Device (arm64), then Product > Archive.
  6. Organizer > Distribute App > TestFlight & App Store > Upload.

For the next TestFlight upload, increase WRONGBOOK_BUILD_NUMBER if your clone does not have full git history.
EOF
