const professionalsRepo = require('../repositories/professionals.repository');
const supabase = require('../config/supabase');

const AVATAR_BUCKET = 'professional-avatars';
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;

class ProfessionalsService {
  async getByEstablishment(establishmentId, activeOnly = false) {
    return professionalsRepo.findByEstablishment(establishmentId, activeOnly);
  }

  async getById(id, establishmentId) {
    const professional = await professionalsRepo.findByIdAndEstablishment(id, establishmentId);
    if (!professional) {
      const err = new Error('Profissional não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return professional;
  }

  async create(payload) {
    return professionalsRepo.create(payload);
  }

  async update(id, establishmentId, payload) {
    await this.getById(id, establishmentId);
    return professionalsRepo.update(id, payload);
  }

  async delete(id, establishmentId) {
    await this.getById(id, establishmentId);
    return professionalsRepo.delete(id);
  }

  async addService(professionalId, serviceId, establishmentId) {
    await this.getById(professionalId, establishmentId);
    return professionalsRepo.addService(professionalId, serviceId);
  }

  async removeService(professionalId, serviceId, establishmentId) {
    await this.getById(professionalId, establishmentId);
    return professionalsRepo.removeService(professionalId, serviceId);
  }

  async getByService(serviceId) {
    return professionalsRepo.findByService(serviceId);
  }

  async uploadAvatar(professionalId, establishmentId, { fileName: _fileName, contentType, base64 }) {
    await this.getById(professionalId, establishmentId);

    if (!base64 || !contentType) {
      const err = new Error('Arquivo inválido.'); err.statusCode = 422; throw err;
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      const err = new Error('Formato não suportado. Use PNG, JPG ou WEBP.'); err.statusCode = 422; throw err;
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > MAX_SIZE) {
      const err = new Error('A imagem deve ter no máximo 2 MB.'); err.statusCode = 422; throw err;
    }

    // ensure bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!(buckets || []).some((b) => b.name === AVATAR_BUCKET)) {
      await supabase.storage.createBucket(AVATAR_BUCKET, { public: true, fileSizeLimit: `${MAX_SIZE}`, allowedMimeTypes: ALLOWED_TYPES });
    }

    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[contentType] || 'jpg';
    const path = `professionals/${professionalId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET)
      .upload(path, buffer, { contentType, upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return professionalsRepo.update(professionalId, { avatar_url: data.publicUrl });
  }
}

module.exports = new ProfessionalsService();
