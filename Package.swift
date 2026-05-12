// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorBilling",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorBilling",
            targets: ["BillingPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.3.0")
    ],
    targets: [
        .target(
            name: "BillingPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin",
            linkerSettings: [
                .linkedFramework("StoreKit")
            ]
        )
    ]
)
