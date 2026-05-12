# Billing test app (Capacitor 8)

Local harness to exercise `capacitor-billing` on Android and iOS.

## Prerequisites

- In the **plugin repo root** (`..`): `npm run build` (generates `dist/`).
- **Android:** Android Studio, SDK, emulator or device; optional `ANDROID_HOME`.
- **Xcode** for iOS. Capacitor 8 uses **Swift Package Manager** for this template (no `pod install` in `test-app`). Physical devices are often easier for real purchases than the simulator.

## One-time setup

```bash
cd test-app
npm install
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

After changing the plugin or `src/`:

```bash
npm run cap:sync
```

## Recommended testing strategy

Split goals: **(A)** bridge & UI, **(B)** real Google / Apple billing.

### A – Fast, no store (day-to-day)

- Run **`npm start`** in `test-app` and use the browser: `capacitor-billing` uses the **web stub** – good for **Capacitor calls, error handling, and UI** without Play Console or a device.
- Optionally load the same build in the native **WebView** (after `cap sync`): still the stub, not real billing.

### B – Android: real Play Billing (recommended “real” path)

There is no stable Google dummy SKU for `queryProductDetails` without a Play listing. Minimum practical setup:

1. Create an app in [Play Console](https://play.google.com/console) whose **applicationId** matches this test app (see `capacitor.config.json` / `android/app/build.gradle`, e.g. `com.carstenklaffke.billingtest`).
2. Add at least one **license tester** Google account (same account on the device/emulator).
3. Create a **managed product** or **subscription** whose ID matches what you enter in the test UI (default `fullversion`); **INAPP** vs **SUBS** must match the Play Console product type.
4. Upload an **AAB** to **internal testing** and publish; testers install via opt-in link **or** (per [Google’s billing testing guide](https://developer.android.com/google/play/billing/test)) use license testers with the correct package name for sideload/debug once the app exists in Console.
5. Device/emulator with **Google Play**, store up to date, signed in with the license tester account.
6. Optional: [Play Billing Lab](https://play.google.com/store/apps/details?id=com.google.android.apps.play.billingtestcompanion) for advanced scenarios (license testers required).

This exercises the **same plugin code path** as production; the product does not need to be “public” for all users (internal testing is enough).

### C – iOS: StoreKit / Sandbox

- In **App Store Connect**, use the same **bundle ID** as this test app, create **sandbox** in-app purchases / subscriptions, and sign in with a **Sandbox Apple ID** on the device. Purchases are often more reliable on **hardware** than on the simulator.

### D – After native plugin changes

From the plugin repo root: **`npm run build`**, then in `test-app`: **`npm run cap:sync`**, then rebuild the native project.

## Configuring product id / type (this harness only)

The **plugin** is app-agnostic: the host app passes `product` and `type` on every call. This **test app** is only a sample shell.

**Default resolution order:**

1. **Last values from the UI** (persisted in `localStorage`).
2. **`VITE_BILLING_TEST_PRODUCT_ID`** / **`VITE_BILLING_TEST_PRODUCT_TYPE`** in `.env.local` (see `.env.example`).
3. **`billingTestDefaults`** in `test-app/capacitor.config.json` (team-wide defaults you can commit).
4. Fallback **`fullversion`** / **`INAPP`** (matches legacy native defaults if parameters were omitted).

The SKU must exist in **your** Play Console / App Store Connect for the **same** `applicationId` / bundle ID as this test app—or change `appId` in `capacitor.config.json` / Xcode to match an app you already configured.

## Android

1. `npx cap open android`
2. Run on an emulator or device.
3. Tap **querySkuDetails**, then **launchBillingFlow**.
4. Real billing needs a Play Console app (e.g. internal test), matching in-app products, and license testers where applicable.

### Logcat: “In-app billing API version 3 is not supported” / “Billing service not connected”

Play Billing is unavailable (no working Play Store channel). Common causes:

- **Emulator without Play Store** – use a system image that shows the **Play Store** icon in the AVD Manager.
- **No Google account** on the device/emulator.
- **Device without Play Store** (some custom ROMs).

Fix: create an AVD with **Google Play**, update the Play Store, sign in with Google, relaunch the test app.

### “Error retrieving product details:” (sometimes with an empty suffix)

Billing connected, but **no product details** for your **applicationId**, **product id**, and **INAPP/SUBS** combination. Typical causes:

1. Product not created in Play Console for this app, or id mismatch (case-sensitive).
2. Product still **draft** or not in a **published track** (e.g. internal testing).
3. **Wrong type** in the app: subscription in Console but `INAPP` in the app (or the opposite).
4. Build not aligned with Console testing (signed build from internal test, license testers, etc.).

After `npx cap sync`, the plugin surfaces clearer errors (e.g. `billingResponseCode` or an explicit empty-product message).

## iOS

1. `npx cap open ios` (opens `ios/App/App.xcodeproj`).
2. Select the **App** scheme, build for simulator or device.
3. Use **App Store Connect** sandbox products and a **Sandbox Apple ID** on the device.

## Notes

- Browser `npm start` uses the web stub only, not a real store.
- Match product id/type in the UI to your Console / Connect configuration.
