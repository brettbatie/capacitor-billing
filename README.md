# billing
Capacitor billing plugin

I implemented this Plugin to use in-App purchases in Ionic Apps with Capacitor as bridge. It is customized for a single product with name "fullversion", so you would have to adjust this for your purposes.

Web is not implemented, so check for "web" like below to handle the case. Android and iOS should open the corresponding stores.

Usage:

```javascript
import {BillingPlugin} from "capacitor-billing";
import {Device} from "@capacitor/device";

BillingPlugin.querySkuDetails().then((result: any) => {
    if (result) {
        if (result.value === "web") {
            setSkuInfos("web")
        } else {
            setSkuInfos({
                price: result.price,
                price_currency_code: result.price_currency_code,
                title: result.title,
                description: result.description
            });
        }
    } else {

    }
})

Device.getInfo().then((info: any) => {
    var product = "PRODUCT_NAME";
    BillingPlugin.launchBillingFlow({
        product: product,
        type: "SUBS"
    }).then((result: any) => {
        if (info.platform === "ios") {
            return BillingPlugin.finishTransaction({transactionId: result.storeKitTransactionID}).then((response: any) => {
                ...
                }
            )
        } else {
            return BillingPlugin.sendAck({purchaseToken: result.purchaseToken}).then((response: any) => {
                ...
                }
            )
        }
    })
})

```

## Android Setup

### 1. Register the Plugin

Register in MainActivity.java
```java
import de.carstenklaffke.billing.BillingPlugin;

this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
        add(BillingPlugin.class);
        }});
```

### 2. Configure Gradle for Capacitor 7

Add the following to your `android/build.gradle` file inside the `allprojects` block:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }

    // Required for Capacitor 7 to resolve Kotlin stdlib conflicts
    configurations.all {
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
    }
}
```

**Why is this needed?** This plugin uses the Google Play Billing Library 7.1.0, which has transitive dependencies on older Kotlin stdlib versions (1.6.21). Capacitor 7 uses newer Kotlin stdlib versions (1.9.25+) where `kotlin-stdlib-jdk7` and `kotlin-stdlib-jdk8` have been merged into the main `kotlin-stdlib`. This exclusion prevents duplicate class errors at build time. This is a standard requirement for Capacitor 7 Android apps and may already be present if you're using other Capacitor plugins.

## iOS Setup:

Add Capability for in-App purchases.
