# Wrong Book iOS / TestFlight wrapper

This folder packages the existing `wrongbook-v2` web application as a native iOS app with Capacitor 8.4.2. The web assets are copied into the app bundle; the production build does **not** use a remote `server.url` wrapper.

## Defaults

- App name: `錯題本`
- Bundle ID: `com.searchrecall.wrongbook`
- Marketing version: `0.1.0`
- Minimum toolchain: Node.js 22+, Xcode 26+
- iOS runtime: Capacitor 8.4.2 / WKWebView
- Camera and photo-library usage descriptions are added automatically.
- App icons are generated from `assets/app-icon-1024.png`.

The defaults can be overridden before generation:

```bash
export WRONGBOOK_BUNDLE_ID=com.yourcompany.wrongbook
export WRONGBOOK_APP_NAME='錯題本'
export WRONGBOOK_VERSION=0.1.0
export WRONGBOOK_BUILD_NUMBER=1
export APPLE_DEVELOPMENT_TEAM=YOURTEAMID   # optional
```

The bundle ID must match the app record you create in App Store Connect. Change it **before the first uploaded build** if you want a different identifier.

## One-command preparation

From this directory on a Mac:

```bash
npm run ios:prepare:testflight
```

The script will:

1. Refuse to continue unless macOS, Node 22+, and Xcode 26+ are active.
2. Install the pinned Capacitor dependencies.
3. Copy the complete Wrong Book web app into `www/` and repair web-only icon paths.
4. Create the native iOS project on first run.
5. Sync the bundled web application into iOS.
6. Apply the app name, bundle ID, version, build number, camera/photo permissions, and app icon set.
7. Perform an unsigned Release build as a packaging sanity check.

Then open Xcode:

```bash
npm run ios:open
```

In **App > Signing & Capabilities**, choose the Apple Developer Team that owns the matching bundle identifier. Run the app on a real iPhone once before uploading.

## Archive for TestFlight

You can archive from Xcode using **Product > Archive**, or after signing is configured run:

```bash
npm run ios:archive
```

The archive opens in Organizer. Choose **Distribute App > TestFlight & App Store > Upload**.

## Updating the web app

Whenever `wrongbook-v2` changes, regenerate the native bundle before archiving:

```bash
npm run ios:sync
npm run ios:verify
```

`www/` is generated and intentionally ignored by git. Do not hand-edit it.

## TestFlight-specific notes

- Apple currently requires uploads to App Store Connect to be built with Xcode 26 or later and the iOS 26 SDK or later.
- An App Store Connect app record must exist before the build can be uploaded.
- Internal TestFlight testing is the fastest first step. External testing can require Beta App Review.
- TestFlight builds expire after 90 days.
- The app sends scanned question data to the existing Wrong Book Supabase Edge Functions, so App Store privacy disclosures should accurately describe that data flow before public release.

See `TESTFLIGHT_CHECKLIST.md` for the remaining account-side steps.
