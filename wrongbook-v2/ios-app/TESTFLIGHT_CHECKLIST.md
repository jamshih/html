# TestFlight checklist — 錯題本

## 1. Apple account / App Store Connect

- [ ] Apple Developer Program membership is active.
- [ ] In App Store Connect > Apps, create the app record before uploading a build.
- [ ] Platform: iOS.
- [ ] App name: `錯題本` (or your final chosen App Store name).
- [ ] Bundle ID: `com.searchrecall.wrongbook` unless you intentionally override it before the first upload.
- [ ] Suggested SKU: `wrongbook-ios-001`.
- [ ] Complete any agreements App Store Connect requires before testing/distribution.

## 2. Local release preparation

```bash
cd wrongbook-v2/ios-app
npm run ios:prepare:testflight
npm run ios:open
```

- [ ] Xcode is version 26 or later.
- [ ] Xcode > Settings > Accounts contains the Apple ID enrolled in the Developer Program.
- [ ] Target `App` > Signing & Capabilities > Team is selected.
- [ ] Bundle identifier in Xcode exactly matches the App Store Connect record.
- [ ] Automatically Manage Signing is enabled unless you intentionally use manual signing.
- [ ] Version is correct (`0.1.0` by default).
- [ ] Build number is unique and higher than any previous uploaded build.
- [ ] Run once on a real iPhone and test camera/photo import, review flow, AI calls, navigation, and persistence.

## 3. Archive and upload

- [ ] Select a generic iOS device / Any iOS Device target.
- [ ] Product > Archive.
- [ ] In Organizer, select the new archive.
- [ ] Validate App.
- [ ] Distribute App > TestFlight & App Store > Upload.
- [ ] Wait for App Store Connect processing to finish.

You can also create the signed archive after Signing & Capabilities is configured:

```bash
npm run ios:archive
```

## 4. Internal TestFlight first

Use internal testing first so the core product can be tested without waiting for external Beta App Review.

Suggested test focus:

- Scan a single question with the camera.
- Choose an existing question image from Photos.
- Confirm recognized student answer and correct answer before it is added to history.
- Review a multiple-choice wrong answer entirely on the phone.
- Confirm handwriting-heavy questions are clearly deferred to paper/tablet instead of forcing a tiny mobile canvas.
- Confirm the bottom navigation stays fixed to the viewport.
- Kill and relaunch the app and verify local learning state remains.
- Verify Supabase AI analysis/tutor requests work from the native `capacitor://localhost` origin.
- Test on both Wi-Fi and cellular data.

## 5. External TestFlight (when ready)

External testing may require Beta App Review. Prepare these fields in TestFlight:

**Beta app description**

> 錯題本會把你做錯的題目整理成可回顧、可重做的學習紀錄。手機版優先讓你快速回想「上次錯在哪裡」並完成不需要手寫的複習；需要計算、作圖或長篇手寫的題目會保留到更適合的裝置上完成。

**What to test**

> 請特別測試拍題／相簿匯入、答案確認、錯因回顧、手機直接作答、複習排程，以及重新開啟 App 後的資料保存。若 AI 辨識錯誤，請記錄題目類型與實際辨識結果。

- [ ] Add a feedback email in TestFlight.
- [ ] Add Beta App Review contact information for external testing.
- [ ] Add any login/demo instructions needed by reviewers.

## 6. Before public App Store submission

- [ ] Finalize app privacy disclosures based on the actual scanned-image/question/AI data flow.
- [ ] Add a privacy policy URL.
- [ ] Complete the current App Store age-rating questions.
- [ ] Answer export-compliance/encryption questions accurately for the shipping build.
- [ ] Add final App Store screenshots, subtitle, description, support URL, and category.
- [ ] Re-check Apple review requirements for minimum functionality and make sure the native build is not merely a remote website wrapper. This project packages the app locally to avoid that architecture.
