const establishmentsRepo = require('../repositories/establishments.repository');
const asaasService = require('./asaas.service');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AsaasAccountService {
  get billingModeOptions() {
    return [
      {
        value: 'checkout_recurring',
        label: 'Checkout recorrente',
        description: 'Cliente assina por checkout hospedado do Asaas.',
      },
      {
        value: 'direct_subscription',
        label: 'Assinatura direta por API',
        description: 'Cartao validado direto pela API com recorrencia automatica.',
      },
      {
        value: 'manual_billing',
        label: 'Cobranca manual',
        description: 'Equipe confirma e cobra fora do checkout automatico.',
      },
    ];
  }

  async createSubaccount(establishmentId, payload) {
    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    if (establishment.asaas_account_id) {
      const err = new Error('Este estabelecimento ja possui uma subconta Asaas configurada.');
      err.statusCode = 409;
      throw err;
    }

    const normalizedPayload = this._normalizeCreatePayload(payload, establishment);
    const created = await asaasService.createSubaccount(normalizedPayload);

    const updated = await establishmentsRepo.update(establishmentId, {
      asaas_account_id: created.id || null,
      asaas_api_key: created.apiKey || null,
      asaas_wallet_id: created.walletId || null,
      asaas_account_email: normalizedPayload.email,
      asaas_person_type: normalizedPayload.personType || null,
      asaas_cpf_cnpj: normalizedPayload.cpfCnpj,
      asaas_birth_date: normalizedPayload.birthDate || null,
      asaas_company_type: normalizedPayload.companyType || null,
      asaas_metadata: created,
      asaas_last_synced_at: new Date().toISOString(),
    });

    return this._serializeSubaccount(updated);
  }

  async getSubaccount(establishmentId, { sync = false } = {}) {
    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    if (!establishment.asaas_account_id) {
      return { configured: false };
    }

    let current = establishment;

    if (sync && establishment.asaas_api_key) {
      current = await this.syncSubaccount(establishmentId);
    }

    return this._serializeSubaccount(current);
  }

  async syncSubaccount(establishmentId) {
    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    if (!establishment.asaas_api_key) {
      const err = new Error('Subconta Asaas sem chave de API armazenada.');
      err.statusCode = 400;
      throw err;
    }

    const [status, documents] = await Promise.all([
      asaasService.getMyAccountStatus(establishment.asaas_api_key),
      this._loadDocumentsSafely(establishment.asaas_api_key),
    ]);

    return establishmentsRepo.update(establishmentId, {
      asaas_account_status: status || {},
      asaas_onboarding_links: this._mapOnboardingLinks(documents),
      asaas_last_synced_at: new Date().toISOString(),
    });
  }

  async updateBillingSettings(establishmentId, payload) {
    const establishment = await establishmentsRepo.findById(establishmentId);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }

    if (!establishment.asaas_account_id) {
      const err = new Error('Configure a subconta Asaas antes de definir o faturamento.');
      err.statusCode = 400;
      throw err;
    }

    const allowedModes = this.billingModeOptions.map((item) => item.value);
    const billingMode = String(payload?.billingMode || '').trim();
    if (!allowedModes.includes(billingMode)) {
      const err = new Error('Modo de faturamento invalido.');
      err.statusCode = 400;
      throw err;
    }

    const updated = await establishmentsRepo.update(establishmentId, {
      asaas_billing_mode: billingMode,
      asaas_billing_updated_at: new Date().toISOString(),
    });

    return this._serializeSubaccount(updated);
  }

  _normalizeCreatePayload(payload, establishment) {
    const clean = (value) => String(value || '').trim();
    const digits = (value) => clean(value).replace(/\D/g, '');

    const normalized = {
      name: clean(payload.name || establishment.name),
      email: clean(payload.email),
      cpfCnpj: digits(payload.cpfCnpj),
      birthDate: clean(payload.birthDate) || null,
      companyType: clean(payload.companyType) || null,
      incomeValue: Number(payload.incomeValue || 0),
      phone: digits(payload.phone),
      mobilePhone: digits(payload.mobilePhone || payload.phone),
      address: clean(payload.address),
      addressNumber: clean(payload.addressNumber),
      complement: clean(payload.complement) || null,
      province: clean(payload.province),
      postalCode: digits(payload.postalCode),
      personType: clean(payload.personType) || null,
    };

    const required = ['name', 'email', 'cpfCnpj', 'phone', 'mobilePhone', 'address', 'addressNumber', 'province', 'postalCode'];
    const missing = required.filter((field) => !normalized[field]);
    if (!normalized.incomeValue || Number.isNaN(normalized.incomeValue) || normalized.incomeValue <= 0) {
      missing.push('incomeValue');
    }

    if (missing.length > 0) {
      const err = new Error(`Preencha os campos obrigatorios da subconta Asaas: ${missing.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }

    return normalized;
  }

  async _loadDocumentsSafely(apiKey) {
    try {
      await sleep(1500);
      return await asaasService.getMyAccountDocuments(apiKey);
    } catch {
      return null;
    }
  }

  _mapOnboardingLinks(documentsResponse) {
    const items = documentsResponse?.data || [];
    return items
      .filter((item) => item?.onboardingUrl)
      .map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        status: item.status,
        onboardingUrl: item.onboardingUrl,
      }));
  }

  _serializeSubaccount(establishment) {
    return {
      configured: Boolean(establishment.asaas_account_id),
      account_id: establishment.asaas_account_id,
      wallet_id: establishment.asaas_wallet_id,
      email: establishment.asaas_account_email,
      person_type: establishment.asaas_person_type,
      cpf_cnpj: establishment.asaas_cpf_cnpj,
      birth_date: establishment.asaas_birth_date,
      company_type: establishment.asaas_company_type,
      api_key_masked: this._maskApiKey(establishment.asaas_api_key),
      api_key: establishment.asaas_api_key || null,
      billing_mode: establishment.asaas_billing_mode || 'checkout_recurring',
      billing_mode_options: this.billingModeOptions,
      billing_updated_at: establishment.asaas_billing_updated_at || null,
      status: establishment.asaas_account_status || {},
      onboarding_links: establishment.asaas_onboarding_links || [],
      last_synced_at: establishment.asaas_last_synced_at,
    };
  }

  _maskApiKey(value) {
    if (!value) return null;
    if (value.length <= 8) return value;
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
}

module.exports = new AsaasAccountService();
