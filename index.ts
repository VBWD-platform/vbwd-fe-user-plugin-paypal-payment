import type { IPlugin, IPlatformSDK } from 'vbwd-view-component';
import { registerPaymentDataContributor } from 'vbwd-view-component';
import { registerCheckoutPaymentMethod } from '@/registries/checkoutPaymentMethods';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
import th from './locales/th.json';
import zh from './locales/zh.json';

export const paypalPaymentPlugin: IPlugin = {
  name: 'paypal-payment',
  version: '1.0.0',
  description: 'PayPal payment processing — redirects to PayPal Checkout',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/pay/paypal',
      name: 'paypal-payment',
      component: () => import('./PayPalPaymentView.vue'),
      meta: { requiresAuth: true, noLayout: true }
    });
    sdk.addRoute({
      path: '/pay/paypal/success',
      name: 'paypal-success',
      component: () => import('./PayPalSuccessView.vue'),
      meta: { requiresAuth: true, noLayout: true }
    });
    sdk.addRoute({
      path: '/pay/paypal/cancel',
      name: 'paypal-cancel',
      component: () => import('./PayPalCancelView.vue'),
      meta: { requiresAuth: true, noLayout: true }
    });

    sdk.addTranslations('en', en);
    sdk.addTranslations('de', de);
    sdk.addTranslations('es', es);
    sdk.addTranslations('fr', fr);
    sdk.addTranslations('ja', ja);
    sdk.addTranslations('ru', ru);
    sdk.addTranslations('th', th);
    sdk.addTranslations('zh', zh);

    // Agnostic post-checkout dispatch: tell core to hop here after invoice creation.
    registerCheckoutPaymentMethod('paypal', {
      redirectPath: (invoiceId) => `/pay/paypal?invoice=${invoiceId}`,
    });

    // PaymentDataBlock contributor: render the ``paypal`` namespace inside the
    // shared "Payment data" block on invoice-detail. The backend paypal plugin
    // writes ``invoice.metadata.paypal = {order_id, capture_id, …}`` on
    // capture via the agnostic ``emit_payment_captured(metadata=…)`` seam.
    registerPaymentDataContributor('paypal', {
      label: 'PayPal transaction',
      format: (data) => {
        const paypalData = (data ?? {}) as {
          capture_id?: string;
          order_id?: string;
          sale_id?: string;
          subscription_id?: string;
        };
        return (
          paypalData.capture_id ||
          paypalData.sale_id ||
          paypalData.order_id ||
          paypalData.subscription_id ||
          '—'
        );
      },
      order: 20,
    });
  },

  activate() { this._active = true; },
  deactivate() { this._active = false; }
};
