#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/app-icon-1024.png"
DEST="$ROOT/ios/App/App/Assets.xcassets/AppIcon.appiconset"

[[ -f "$SRC" ]] || { echo "Missing $SRC" >&2; exit 1; }
[[ -d "$DEST" ]] || { echo "Missing $DEST. Generate the iOS project first." >&2; exit 1; }
command -v sips >/dev/null || { echo "sips is required on macOS." >&2; exit 1; }

rm -f "$DEST"/*.png

make_icon() {
  local px="$1" name="$2"
  sips -z "$px" "$px" "$SRC" --out "$DEST/$name" >/dev/null
}

make_icon 20 AppIcon-20.png
make_icon 29 AppIcon-29.png
make_icon 40 AppIcon-40.png
make_icon 58 AppIcon-58.png
make_icon 60 AppIcon-60.png
make_icon 76 AppIcon-76.png
make_icon 80 AppIcon-80.png
make_icon 87 AppIcon-87.png
make_icon 120 AppIcon-120.png
make_icon 152 AppIcon-152.png
make_icon 167 AppIcon-167.png
make_icon 180 AppIcon-180.png
cp "$SRC" "$DEST/AppIcon-1024.png"

cat > "$DEST/Contents.json" <<'JSON'
{
  "images" : [
    {"idiom":"iphone","size":"20x20","scale":"2x","filename":"AppIcon-40.png"},
    {"idiom":"iphone","size":"20x20","scale":"3x","filename":"AppIcon-60.png"},
    {"idiom":"iphone","size":"29x29","scale":"2x","filename":"AppIcon-58.png"},
    {"idiom":"iphone","size":"29x29","scale":"3x","filename":"AppIcon-87.png"},
    {"idiom":"iphone","size":"40x40","scale":"2x","filename":"AppIcon-80.png"},
    {"idiom":"iphone","size":"40x40","scale":"3x","filename":"AppIcon-120.png"},
    {"idiom":"iphone","size":"60x60","scale":"2x","filename":"AppIcon-120.png"},
    {"idiom":"iphone","size":"60x60","scale":"3x","filename":"AppIcon-180.png"},
    {"idiom":"ipad","size":"20x20","scale":"1x","filename":"AppIcon-20.png"},
    {"idiom":"ipad","size":"20x20","scale":"2x","filename":"AppIcon-40.png"},
    {"idiom":"ipad","size":"29x29","scale":"1x","filename":"AppIcon-29.png"},
    {"idiom":"ipad","size":"29x29","scale":"2x","filename":"AppIcon-58.png"},
    {"idiom":"ipad","size":"40x40","scale":"1x","filename":"AppIcon-40.png"},
    {"idiom":"ipad","size":"40x40","scale":"2x","filename":"AppIcon-80.png"},
    {"idiom":"ipad","size":"76x76","scale":"1x","filename":"AppIcon-76.png"},
    {"idiom":"ipad","size":"76x76","scale":"2x","filename":"AppIcon-152.png"},
    {"idiom":"ipad","size":"83.5x83.5","scale":"2x","filename":"AppIcon-167.png"},
    {"idiom":"ios-marketing","size":"1024x1024","scale":"1x","filename":"AppIcon-1024.png"}
  ],
  "info" : {"author":"xcode","version":1}
}
JSON

printf 'Generated iOS AppIcon set from %s\n' "$SRC"
