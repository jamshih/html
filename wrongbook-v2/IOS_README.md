# Wrong Book — iPhone build

This directory remains the source of truth for the existing Wrong Book web app. Capacitor packages the same HTML/CSS/JS into a native iOS WKWebView project; do not fork or rewrite the learning engine for iPhone.

## Requirements

- macOS
- Node.js 22+
- Xcode 26.0+ with Xcode Command Line Tools
- An Apple Developer signing team when installing on a physical iPhone or distributing through TestFlight/App Store Connect

Capacitor 8 uses Swift Package Manager by default, so CocoaPods is not required for this base project.

## First native setup

From `wrongbook-v2`:

```bash
npm install
npm run ios:add
npm run ios:open
```

`ios:add` does four things:

1. Builds a self-contained `dist/` copy of the current Wrong Book web app.
2. Creates the native `ios/` project with Capacitor.
3. Adds camera/photo-library permission descriptions for the existing scan/photo flow.
4. Generates native iOS app icons and splash assets from `assets/`.

In Xcode, select the `App` target, choose your Apple Development Team under Signing & Capabilities, select your iPhone, and Run.

## Normal development loop

After changing Wrong Book web code:

```bash
npm run ios:open
```

That command rebuilds `dist/`, runs `cap sync ios`, reapplies the iOS permission strings, regenerates native assets, and opens Xcode.

To run from Terminal instead:

```bash
npm run ios:run
```

## Bundle identifier

The initial bundle identifier is `com.jamshih.wrongbook` in `capacitor.config.json`. Change it before App Store submission if a different final identifier is desired, then regenerate the native project so Xcode and Capacitor agree.

## What is deliberately unchanged

- Existing Wrong Book JS/CSS learning behavior
- Earth Science / Chemistry mind maps and reference maps
- Tutor, handwriting, scan, cloud-sync, Recall/Learn, and paper-first logic
- Existing GitHub Pages deployment

The iOS preparation layer is additive and isolated from those systems.

## Native web-bundle guard

The web app currently references legacy icons through `../wrongbook-prototype/...`. `scripts/prepare-ios-web.mjs` rewrites those paths only in the generated `dist/` bundle and verifies that no such parent-relative reference remains. This prevents missing assets inside the iOS app sandbox while leaving the deployed source untouched.
