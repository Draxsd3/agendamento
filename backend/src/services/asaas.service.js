const env = require('../config/env');

class AsaasService {
  get enabled() {
    return Boolean(env.asaas.apiKey);
  }

  get diagnostics() {
    return {
      enabled: this.enabled,
      environment: env.asaas.environment,
      baseUrl: this.baseUrl,
    };
  }

  get baseUrl() {
    return env.asaas.environment === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3';
  }

  ensureConfigured() {
    if (!this.enabled) {
      const err = new Error('Integracao com Asaas indisponivel. Configure ASAAS_API_KEY no backend.');
      err.statusCode = 503;
      throw err;
    }
  }

  async request(path, options = {}) {
    this.ensureConfigured();
    const token = options.apiKey || env.asaas.apiKey;

    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: token,
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (cause) {
      const err = new Error('Nao foi possivel conectar ao Asaas.');
      err.statusCode = 502;
      err.cause = cause;
      throw err;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(payload?.errors?.[0]?.description || payload?.message || 'Erro ao comunicar com o Asaas.');
      err.statusCode = response.status;
      err.details = payload;
      throw err;
    }

    return payload;
  }

  async createCustomer(customer, apiKey) {
    return this.request('/customers', {
      method: 'POST',
      body: customer,
      apiKey,
    });
  }

  async createSubaccount(account) {
    return this.request('/accounts', {
      method: 'POST',
      body: account,
    });
  }

  async getMyAccountStatus(apiKey) {
    return this.request('/myAccount/status', {
      method: 'GET',
      apiKey,
    });
  }

  async getRootAccountStatus() {
    return this.getMyAccountStatus(env.asaas.apiKey);
  }

  async getMyAccountDocuments(apiKey) {
    return this.request('/myAccount/documents', {
      method: 'GET',
      apiKey,
    });
  }

  async updateCustomer(customerId, customer, apiKey) {
    return this.request(`/customers/${customerId}`, {
      method: 'POST',
      body: customer,
      apiKey,
    });
  }

  async createRecurringCheckout({ customerId, plan, callbacks, nextDueDate, apiKey }) {
    return this.request('/checkouts', {
      method: 'POST',
      apiKey,
      body: {
        billingTypes: ['CREDIT_CARD'],
        chargeTypes: ['RECURRENT'],
        minutesToExpire: env.asaas.checkout.minutesToExpire,
        callback: callbacks,
        customer: customerId,
        items: [
          {
            name: plan.name,
            description: plan.description || `Assinatura do plano ${plan.name}`,
            quantity: 1,
            value: Number(plan.price),
          },
        ],
        subscription: {
          cycle: this.mapCycle(plan.billing_interval),
          nextDueDate,
        },
      },
    });
  }

  async cancelSubscription(subscriptionId, apiKey) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      apiKey,
    });
  }

  mapCycle(interval) {
    const cycles = {
      monthly: 'MONTHLY',
      quarterly: 'QUARTERLY',
      annual: 'YEARLY',
    };

    return cycles[interval] || 'MONTHLY';
  }
}

module.exports = new AsaasService();
