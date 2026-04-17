const establishmentsRepo = require('../repositories/establishments.repository');
const supabase = require('../config/supabase');

const BRANDING_BUCKET = 'establishment-branding';
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

// Slugs that conflict with frontend routes
const RESERVED_SLUGS = new Set([
  'login', 'cadastro', 'recuperar-senha',
  'admin', 'super-admin', 'minha-conta',
  'agendamento', 'planos', 'agendar',
  'cliente', 'api', 'assets', 'static',
]);

// Campos que podem vazar dados de pagamento, PII fiscal e chaves de integracao.
// NUNCA expor esses campos em rotas publicas.
const PRIVATE_FIELDS = [
  'asaas_account_id', 'asaas_api_key', 'asaas_wallet_id',
  'asaas_account_email', 'asaas_person_type', 'asaas_cpf_cnpj',
  'asaas_birth_date', 'asaas_company_type', 'asaas_account_status',
  'asaas_onboarding_links', 'asaas_metadata', 'asaas_last_synced_at',
  'asaas_billing_mode', 'asaas_billing_updated_at',
];

class EstablishmentsService {
  sanitizePublic(establishment) {
    if (!establishment) return establishment;
    const safe = Object.assign({}, establishment);
    for (const field of PRIVATE_FIELDS) {
      delete safe[field];
    }
    return safe;
  }

  async getAll(filters) {
    return establishmentsRepo.findAllPaginated(filters);
  }

  async getById(id) {
    const establishment = await establishmentsRepo.findById(id);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return establishment;
  }

  async getBySlug(slug) {
    const establishment = await establishmentsRepo.findBySlug(slug);
    if (!establishment) {
      const err = new Error('Estabelecimento nao encontrado.');
      err.statusCode = 404;
      throw err;
    }
    if (establishment.status !== 'active') {
      const err = new Error('Estabelecimento nao esta ativo.');
      err.statusCode = 403;
      throw err;
    }
    return this.sanitizePublic(establishment);
  }

  async getAdminEstablishment(id) {
    if (!id) {
      const err = new Error('Administrador sem estabelecimento vinculado.');
      err.statusCode = 400;
      throw err;
    }
    return this.getById(id);
  }

  _validateSlug(slug) {
    if (RESERVED_SLUGS.has(slug)) {
      const err = new Error('O slug "' + slug + '" e reservado pelo sistema. Escolha outro identificador.');
      err.statusCode = 409;
      throw err;
    }
  }

  async create(payload) {
    this._validateSlug(payload.slug);
    const existing = await establishmentsRepo.findBySlug(payload.slug);
    if (existing) {
      const err = new Error('Slug ja esta em uso. Escolha outro identificador.');
      err.statusCode = 409;
      throw err;
    }
    return establishmentsRepo.create(payload);
  }

  async update(id, payload) {
    await this.getById(id);

    if (payload.slug) {
      this._validateSlug(payload.slug);
      const existing = await establishmentsRepo.findBySlug(payload.slug);
      if (existing && existing.id !== id) {
        const err = new Error('Slug ja esta em uso.');
        err.statusCode = 409;
        throw err;
      }
    }

    return establishmentsRepo.update(id, payload);
  }

  async updateBranding(id, payload) {
    const establishment = await this.getAdminEstablishment(id);

    const normalizeText = (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    };

    const normalizeColor = (value, fallback) => {
      if (typeof value !== 'string') return fallback;
      const trimmed = value.trim();
      return trimmed ? trimmed.toUpperCase() : fallback;
    };

    const allowed = {
      logo_url: normalizeText(payload.logo_url),
      primary_color: normalizeColor(payload.primary_color, establishment.primary_color || '#2563EB'),
      accent_color: normalizeColor(payload.accent_color, establishment.accent_color || '#0F172A'),
      booking_heading: normalizeText(payload.booking_heading),
      booking_subheading: normalizeText(payload.booking_subheading),
    };

    return establishmentsRepo.update(id, allowed);
  }

  async uploadCover(id, payload) {
    await this.getAdminEstablishment(id);

    const fileName    = typeof payload.fileName    === 'string' ? payload.fileName.trim()    : 'cover.jpg';
    const contentType = typeof payload.contentType === 'string' ? payload.contentType.trim() : '';
    const base64      = typeof payload.base64      === 'string' ? payload.base64.trim()      : '';

    if (!base64 || !contentType) {
      const err = new Error('Arquivo de capa invalido.'); err.statusCode = 422; throw err;
    }
    if (!ALLOWED_LOGO_TYPES.includes(contentType)) {
      const err = new Error('Formato nao suportado. Use PNG, JPG ou WEBP.'); err.statusCode = 422; throw err;
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > MAX_LOGO_SIZE_BYTES) {
      const err = new Error('A capa deve ter no maximo 2 MB.'); err.statusCode = 422; throw err;
    }

    await this.ensureBrandingBucket();
    const extension = this.getLogoExtension(contentType, fileName);
    const path = 'establishments/' + id + '/cover-' + Date.now() + '.' + extension;

    const { error: uploadError } = await supabase.storage.from(BRANDING_BUCKET)
      .upload(path, buffer, { contentType, upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(path);
    const establishment = await establishmentsRepo.update(id, { cover_url: data.publicUrl });
    return { cover_url: establishment.cover_url, storage_path: path };
  }

  async uploadLogo(id, payload) {
    await this.getAdminEstablishment(id);

    const fileName    = typeof payload.fileName    === 'string' ? payload.fileName.trim()    : 'logo.png';
    const contentType = typeof payload.contentType === 'string' ? payload.contentType.trim() : '';
    const base64      = typeof payload.base64      === 'string' ? payload.base64.trim()      : '';

    if (!base64 || !contentType) {
      const err = new Error('Arquivo de logo invalido.');
      err.statusCode = 422;
      throw err;
    }

    if (!ALLOWED_LOGO_TYPES.includes(contentType)) {
      const err = new Error('Formato nao suportado. Use PNG, JPG ou WEBP.');
      err.statusCode = 422;
      throw err;
    }

    const buffer = Buffer.from(base64, 'base64');

    if (!buffer.length || Number.isNaN(buffer.length)) {
      const err = new Error('Nao foi possivel processar o arquivo enviado.');
      err.statusCode = 422;
      throw err;
    }

    if (buffer.length > MAX_LOGO_SIZE_BYTES) {
      const err = new Error('A logo deve ter no maximo 2 MB.');
      err.statusCode = 422;
      throw err;
    }

    await this.ensureBrandingBucket();

    const extension = this.getLogoExtension(contentType, fileName);
    const path = 'establishments/' + id + '/logo-' + Date.now() + '.' + extension;

    const { error: uploadError } = await supabase
      .storage
      .from(BRANDING_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(path);
    const establishment = await establishmentsRepo.update(id, { logo_url: data.publicUrl });

    return {
      logo_url: establishment.logo_url,
      storage_path: path,
    };
  }

  async ensureBrandingBucket() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const exists = (buckets || []).some((bucket) => bucket.name === BRANDING_BUCKET);
    if (exists) return;

    const { error: createError } = await supabase.storage.createBucket(BRANDING_BUCKET, {
      public: true,
      fileSizeLimit: String(MAX_LOGO_SIZE_BYTES),
      allowedMimeTypes: ALLOWED_LOGO_TYPES,
    });

    if (createError && !String(createError.message || '').includes('already exists')) {
      throw createError;
    }
  }

  getLogoExtension(contentType, fileName) {
    const byType = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
    };

    const sanitized = fileName.toLowerCase();
    const hinted = sanitized.includes('.') ? sanitized.split('.').pop() : '';
    return byType[contentType] || hinted || 'png';
  }

  async delete(id) {
    await this.getById(id);
    return establishmentsRepo.delete(id);
  }

  async setStatus(id, status) {
    await this.getById(id);
    return establishmentsRepo.update(id, { status });
  }
}

module.exports = new EstablishmentsService();
