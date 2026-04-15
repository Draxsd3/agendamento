const subscriptionsRepo = require('../repositories/subscriptions.repository');
const plansRepo = require('../repositories/plans.repository');
const customersRepo = require('../repositories/customers.repository');
const establishmentsRepo = require('../repositories/establishments.repository');
const asaasService = require('./asaas.service');
const env = require('../config/env');

class SubscriptionsService {
  async getMySubscriptions(userId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return subscriptionsRepo.findByCustomer(customer.id);
  }

  async subscribe(userId, planId, callbackUrls = {}) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const plan = await plansRepo.findById(planId);
    if (!plan || !plan.is_active) {
      const err = new Error('Plano nao encontrado ou inativo.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await subscriptionsRepo.findActiveByCustomerAndEstablishment(
      customer.id,
      plan.establishment_id
    );

    if (existing) {
      const err = new Error('Voce ja possui uma assinatura ativa para este estabelecimento.');
      err.statusCode = 409;
      throw err;
    }

    const pending = await subscriptionsRepo.findPendingByCustomerAndEstablishment(
      customer.id,
      plan.establishment_id
    );

    const pendingCheckoutUrl = pending?.metadata?.checkout?.link || pending?.checkout_url;
    if (pendingCheckoutUrl) {
      return {
        subscription: pending,
        checkout: {
          id: pending.provider_checkout_id,
          url: pendingCheckoutUrl,
          expires_in_minutes: env.asaas.checkout.minutesToExpire,
        },
      };
    }

    const asaasContext = await this._resolveAsaasContext(plan.establishment_id, customer.id);
    const providerCustomerId = await this._ensureAsaasCustomer(customer, {
      establishmentId: plan.establishment_id,
      existingProviderCustomerId: asaasContext.providerCustomerId,
      apiKey: asaasContext.apiKey,
      persistOnCustomer: !asaasContext.usesSubaccount,
    });
    const nextDueDate = this._calcNextDueDate();
    const callbacks = this._buildCallbacks(callbackUrls);

    const checkout = await asaasService.createRecurringCheckout({
      customerId: providerCustomerId,
      plan,
      callbacks,
      nextDueDate,
      apiKey: asaasContext.apiKey,
    });

    const localSubscription = await subscriptionsRepo.create({
      customer_id: customer.id,
      plan_id: planId,
      establishment_id: plan.establishment_id,
      status: 'pending',
      started_at: new Date().toISOString(),
      payment_provider: 'asaas',
      provider_customer_id: providerCustomerId,
      provider_checkout_id: checkout.id,
      checkout_url: checkout.link || this._buildCheckoutUrl(checkout.id),
      payment_method: 'credit_card',
      payment_status: 'checkout_created',
      metadata: {
        checkout,
        uses_subaccount: asaasContext.usesSubaccount,
        establishment_wallet_id: asaasContext.walletId,
      },
    });

    return {
      subscription: localSubscription,
      checkout: {
        id: checkout.id,
        url: checkout.link || this._buildCheckoutUrl(checkout.id),
        expires_in_minutes: env.asaas.checkout.minutesToExpire,
      },
    };
  }

  async cancel(userId, subscriptionId) {
    const customer = await customersRepo.findByUserId(userId);
    if (!customer) {
      const err = new Error('Perfil de cliente nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const sub = await subscriptionsRepo.findById(subscriptionId);
    if (!sub || sub.customer_id !== customer.id) {
      const err = new Error('Assinatura nao encontrada.');
      err.statusCode = 404;
      throw err;
    }

    if (sub.provider_subscription_id) {
      const asaasContext = await this._resolveAsaasContext(sub.establishment_id, customer.id);
      await asaasService.cancelSubscription(sub.provider_subscription_id, asaasContext.apiKey);
    }

    return subscriptionsRepo.update(subscriptionId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      payment_status: 'cancelled',
    });
  }

  async getByEstablishment(establishmentId) {
    return subscriptionsRepo.findByEstablishment(establishmentId);
  }

  async handleAsaasWebhook(payload, authToken) {
    this._validateWebhookToken(authToken);

    switch (payload?.event) {
      case 'CHECKOUT_CREATED':
        return this._handleCheckoutCreated(payload.checkout);
      case 'CHECKOUT_EXPIRED':
      case 'CHECKOUT_CANCELED':
        return this._handleCheckoutClosed(payload);
      case 'CHECKOUT_PAID':
        return this._handleCheckoutPaid(payload.checkout);
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
        return this._handleSubscriptionEvent(payload.subscription);
      case 'SUBSCRIPTION_INACTIVATED':
      case 'SUBSCRIPTION_DELETED':
        return this._handleSubscriptionInactive(payload.subscription);
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        return this._handlePaymentPaid(payload.payment);
      case 'PAYMENT_CREATED':
      case 'PAYMENT_UPDATED':
        return this._handlePaymentCreatedOrUpdated(payload.payment);
      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_RESTORED':
        return this._handlePaymentStatus(payload.payment, payload.event);
      default:
        return { ignored: true, event: payload?.event || 'unknown' };
    }
  }

  async _ensureAsaasCustomer(customer, options = {}) {
    const customerPayload = this._buildAsaasCustomerPayload(customer);

    if (options.existingProviderCustomerId) {
      await asaasService.updateCustomer(options.existingProviderCustomerId, customerPayload, options.apiKey);
      if (options.persistOnCustomer) {
        await customersRepo.update(customer.id, {
          asaas_customer_synced_at: new Date().toISOString(),
        });
      }
      return options.existingProviderCustomerId;
    }

    if (options.persistOnCustomer && customer.asaas_customer_id) {
      await asaasService.updateCustomer(customer.asaas_customer_id, customerPayload, options.apiKey);
      await customersRepo.update(customer.id, {
        asaas_customer_synced_at: new Date().toISOString(),
      });
      return customer.asaas_customer_id;
    }

    const createdCustomer = await asaasService.createCustomer(customerPayload, options.apiKey);

    if (options.persistOnCustomer) {
      await customersRepo.update(customer.id, {
        asaas_customer_id: createdCustomer.id,
        asaas_customer_synced_at: new Date().toISOString(),
      });
    }

    return createdCustomer.id;
  }

  async _resolveAsaasContext(establishmentId, customerId) {
    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const usesSubaccount = Boolean(establishment.asaas_api_key);
    if (!usesSubaccount) {
      return {
        apiKey: undefined,
        usesSubaccount: false,
        walletId: null,
        providerCustomerId: null,
      };
    }

    const latestSubscription = await subscriptionsRepo.findLatestByCustomerAndEstablishment(customerId, establishmentId);
    return {
      apiKey: establishment.asaas_api_key,
      usesSubaccount: true,
      walletId: establishment.asaas_wallet_id || null,
      providerCustomerId: latestSubscription?.provider_customer_id || null,
    };
  }

  _buildCallbacks(callbackUrls = {}) {
    const successUrl = callbackUrls.success_url || env.asaas.checkout.successUrl;
    const cancelUrl = callbackUrls.cancel_url || env.asaas.checkout.cancelUrl;
    const expiredUrl = callbackUrls.expired_url || env.asaas.checkout.expiredUrl;

    if (!successUrl || !cancelUrl || !expiredUrl) {
      const err = new Error('Defina as URLs de callback do checkout do Asaas no .env ou na requisicao.');
      err.statusCode = 400;
      throw err;
    }

    return {
      successUrl,
      cancelUrl,
      expiredUrl,
    };
  }

  _buildCheckoutUrl(checkoutId) {
    if (env.asaas.environment === 'production') {
      return `https://www.asaas.com/checkoutSession/show/${checkoutId}`;
    }

    return `https://sandbox.asaas.com/checkoutSession/show/${checkoutId}`;
  }

  _calcNextDueDate() {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 5);
    return this._formatAsaasDateTime(next);
  }

  _validateWebhookToken(authToken) {
    if (!env.asaas.webhookToken) return;

    if (authToken !== env.asaas.webhookToken) {
      const err = new Error('Webhook do Asaas nao autorizado.');
      err.statusCode = 401;
      throw err;
    }
  }

  async _handleCheckoutCreated(checkout) {
    if (!checkout?.id) return { ignored: true, reason: 'missing_checkout_id' };

    const localSubscription = await subscriptionsRepo.findByProviderCheckoutId(checkout.id);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      payment_status: 'checkout_created',
      metadata: {
        ...(localSubscription.metadata || {}),
        checkout,
      },
    });

    return { ok: true };
  }

  async _handleCheckoutClosed(payload) {
    const checkout = payload?.checkout;
    if (!checkout?.id) return { ignored: true, reason: 'missing_checkout_id' };

    const localSubscription = await subscriptionsRepo.findByProviderCheckoutId(checkout.id);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      payment_status: payload.event.toLowerCase(),
      metadata: {
        ...(localSubscription.metadata || {}),
        checkout,
      },
    });

    return { ok: true };
  }

  async _handleCheckoutPaid(checkout) {
    if (!checkout?.id) return { ignored: true, reason: 'missing_checkout_id' };

    const localSubscription = await subscriptionsRepo.findByProviderCheckoutId(checkout.id);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      payment_status: 'checkout_paid',
      metadata: {
        ...(localSubscription.metadata || {}),
        checkout,
      },
    });

    return { ok: true };
  }

  async _handleSubscriptionEvent(subscription) {
    if (!subscription?.id) return { ignored: true, reason: 'missing_subscription_id' };

    let localSubscription = await subscriptionsRepo.findByProviderSubscriptionId(subscription.id);
    if (!localSubscription && subscription.customer) {
      localSubscription = await subscriptionsRepo.findLatestPendingByProviderCustomerId(subscription.customer);
    }
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      status: localSubscription.status,
      provider_subscription_id: subscription.id,
      provider_customer_id: subscription.customer,
      payment_provider: 'asaas',
      payment_status: subscription.status.toLowerCase(),
      expires_at: this._parseAsaasDate(subscription.nextDueDate),
      metadata: {
        ...(localSubscription.metadata || {}),
        asaas_subscription: subscription,
      },
    });

    return { ok: true };
  }

  async _handleSubscriptionInactive(subscription) {
    if (!subscription?.id) return { ignored: true, reason: 'missing_subscription_id' };

    const localSubscription = await subscriptionsRepo.findByProviderSubscriptionId(subscription.id);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      payment_status: subscription.status?.toLowerCase() || 'inactive',
      metadata: {
        ...(localSubscription.metadata || {}),
        asaas_subscription: subscription,
      },
    });

    return { ok: true };
  }

  async _handlePaymentPaid(payment) {
    if (!payment?.subscription) return { ignored: true, reason: 'missing_subscription_id' };

    const localSubscription = await subscriptionsRepo.findByProviderSubscriptionId(payment.subscription);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    const plan = await plansRepo.findById(localSubscription.plan_id);

    await subscriptionsRepo.update(localSubscription.id, {
      status: 'active',
      provider_payment_id: payment.id,
      payment_status: payment.status?.toLowerCase() || 'received',
      expires_at: this._calcExpiresAt(plan?.billing_interval),
      metadata: {
        ...(localSubscription.metadata || {}),
        last_payment: payment,
      },
    });

    return { ok: true };
  }

  async _handlePaymentStatus(payment, event) {
    if (!payment?.subscription) return { ignored: true, reason: 'missing_subscription_id' };

    const localSubscription = await subscriptionsRepo.findByProviderSubscriptionId(payment.subscription);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    const status = event === 'PAYMENT_DELETED' ? 'cancelled' : localSubscription.status;

    await subscriptionsRepo.update(localSubscription.id, {
      status,
      provider_payment_id: payment.id,
      payment_status: payment.status?.toLowerCase() || event.toLowerCase(),
      metadata: {
        ...(localSubscription.metadata || {}),
        last_payment: payment,
      },
    });

    return { ok: true };
  }

  async _handlePaymentCreatedOrUpdated(payment) {
    if (!payment?.subscription) return { ignored: true, reason: 'missing_subscription_id' };

    const localSubscription = await subscriptionsRepo.findByProviderSubscriptionId(payment.subscription);
    if (!localSubscription) return { ignored: true, reason: 'subscription_not_found' };

    await subscriptionsRepo.update(localSubscription.id, {
      provider_payment_id: payment.id,
      payment_status: payment.status?.toLowerCase() || 'pending',
      metadata: {
        ...(localSubscription.metadata || {}),
        last_payment: payment,
      },
    });

    return { ok: true };
  }

  _calcExpiresAt(interval) {
    const now = new Date();

    if (interval === 'monthly') now.setMonth(now.getMonth() + 1);
    if (interval === 'quarterly') now.setMonth(now.getMonth() + 3);
    if (interval === 'annual') now.setFullYear(now.getFullYear() + 1);

    return now.toISOString();
  }

  _formatAsaasDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  _parseAsaasDate(value) {
    if (!value) return null;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00`).toISOString();
    }

    const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  _buildAsaasCustomerPayload(customer) {
    const parsedAddress = this._parseCustomerAddress(customer.address);
    const sanitizedCpf = this._onlyDigits(customer.cpf);
    const sanitizedPhone = this._onlyDigits(customer.phone);
    const sanitizedPostalCode = this._onlyDigits(parsedAddress.postalCode);
    const province = (customer.province || '').trim();
    const city = (customer.city || '').trim();
    const address = (parsedAddress.address || '').trim();
    const addressNumber = (parsedAddress.addressNumber || '').trim();

    const missingFields = [];
    if (!sanitizedCpf) missingFields.push('CPF');
    if (!sanitizedPhone) missingFields.push('telefone');
    if (!address) missingFields.push('rua');
    if (!addressNumber) missingFields.push('numero');
    if (!sanitizedPostalCode) missingFields.push('CEP');
    if (!province) missingFields.push('bairro');
    if (!city) missingFields.push('cidade');

    if (missingFields.length > 0) {
      const err = new Error(`Complete seu perfil antes de assinar: ${missingFields.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    return {
      name: customer.users?.name,
      email: customer.users?.email,
      cpfCnpj: sanitizedCpf,
      phone: sanitizedPhone,
      mobilePhone: sanitizedPhone,
      address,
      addressNumber,
      complement: parsedAddress.complement || undefined,
      postalCode: sanitizedPostalCode,
      province,
      city,
      externalReference: customer.id,
    };
  }

  _parseCustomerAddress(rawAddress) {
    if (!rawAddress) {
      return {
        address: '',
        addressNumber: '',
        complement: '',
        postalCode: '',
      };
    }

    try {
      const parsed = JSON.parse(rawAddress);
      return {
        address: parsed.street || '',
        addressNumber: parsed.number || '',
        complement: parsed.complement || '',
        postalCode: parsed.cep || '',
      };
    } catch {
      return {
        address: rawAddress,
        addressNumber: '',
        complement: '',
        postalCode: '',
      };
    }
  }

  _onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }
}

module.exports = new SubscriptionsService();
