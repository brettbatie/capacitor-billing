export interface BillingPluginPlugin {
  querySkuDetails(options: {product: string, type: string}): Promise<{value: string}>;
  launchBillingFlow(options: {product: string, type: string}): Promise<{value: string}>;
  sendAck(options: {purchaseToken: string}): Promise<{value: string}>;
  finishTransaction(options: {transactionId: string}): Promise<{value: string}>;
}
