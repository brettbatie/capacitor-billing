import { Capacitor } from '@capacitor/core';
import { BillingPlugin } from 'capacitor-billing';
import capConfig from '../../capacitor.config.json';

const LS_KEY = 'capacitor-billing-test-app';

const logEl = document.getElementById('log');

function formatErr(e) {
  if (e == null) return String(e);
  if (typeof e === 'string') return e;
  const msg = e.message ?? e.errorMessage;
  if (msg) return msg;
  try {
    return JSON.stringify(e, Object.getOwnPropertyNames(e), 2);
  } catch {
    return String(e);
  }
}

function log(...args) {
  const line = args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 2)))
    .join(' ');
  logEl.textContent = `${line}\n\n` + logEl.textContent;
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePrefs() {
  const product = document.getElementById('product').value.trim();
  const type = document.getElementById('type').value;
  localStorage.setItem(LS_KEY, JSON.stringify({ product, type }));
}

function resolveInitialSku() {
  const prefs = loadPrefs();
  if (prefs && typeof prefs.product === 'string' && prefs.product.trim()) {
    return {
      product: prefs.product.trim(),
      type: prefs.type === 'SUBS' ? 'SUBS' : 'INAPP',
    };
  }

  const capDef = capConfig.billingTestDefaults || {};
  const envProduct = import.meta.env.VITE_BILLING_TEST_PRODUCT_ID;
  const envType = import.meta.env.VITE_BILLING_TEST_PRODUCT_TYPE;

  const product =
    (typeof envProduct === 'string' && envProduct.trim()) ||
    (typeof capDef.productId === 'string' && capDef.productId.trim()) ||
    'fullversion';

  const type =
    envType === 'SUBS' || envType === 'INAPP'
      ? envType
      : capDef.productType === 'SUBS' || capDef.productType === 'INAPP'
        ? capDef.productType
        : 'INAPP';

  return { product, type };
}

function initForm() {
  const { product, type } = resolveInitialSku();
  const productEl = document.getElementById('product');
  const typeEl = document.getElementById('type');
  productEl.value = product;
  typeEl.value = type;

  productEl.addEventListener('change', savePrefs);
  productEl.addEventListener('blur', savePrefs);
  typeEl.addEventListener('change', savePrefs);
}

function opts() {
  const product = document.getElementById('product').value.trim() || 'fullversion';
  const type = document.getElementById('type').value;
  return { product, type };
}

initForm();

document.getElementById('btn-query').addEventListener('click', async () => {
  try {
    log('Platform:', Capacitor.getPlatform());
    const result = await BillingPlugin.querySkuDetails(opts());
    log('querySkuDetails OK:', result);
  } catch (e) {
    log('querySkuDetails Fehler:', formatErr(e));
  }
});

document.getElementById('btn-purchase').addEventListener('click', async () => {
  try {
    log('launchBillingFlow …', opts());
    const result = await BillingPlugin.launchBillingFlow(opts());
    log('launchBillingFlow Antwort:', result);
    if (Capacitor.getPlatform() === 'ios' && result?.storeKitTransactionID) {
      const fin = await BillingPlugin.finishTransaction({
        transactionId: result.storeKitTransactionID,
      });
      log('finishTransaction:', fin);
    } else if (Capacitor.getPlatform() === 'android' && result?.purchaseToken) {
      const ack = await BillingPlugin.sendAck({ purchaseToken: result.purchaseToken });
      log('sendAck:', ack);
    }
  } catch (e) {
    log('launchBillingFlow / Folgeschritt Fehler:', formatErr(e));
  }
});

log(
  'Ready. Product id/type: UI + localStorage, then VITE_BILLING_TEST_* / billingTestDefaults in capacitor.config.json.',
);
