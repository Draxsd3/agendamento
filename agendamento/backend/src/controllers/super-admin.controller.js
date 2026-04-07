const superAdminService = require('../services/super-admin.service');

class SuperAdminController {
  async getDashboard(req, res, next) {
    try {
      const result = await superAdminService.getDashboardStats();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getEstablishmentById(req, res, next) {
    try {
      const result = await superAdminService.getEstablishmentById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getEstablishmentAdmins(req, res, next) {
    try {
      const result = await superAdminService.getEstablishmentAdmins(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllEstablishments(req, res, next) {
    try {
      const result = await superAdminService.getAllEstablishments(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createEstablishment(req, res, next) {
    try {
      const result = await superAdminService.createEstablishment(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async createAdminUser(req, res, next) {
    try {
      const result = await superAdminService.createAdminUser(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await superAdminService.getAllUsers(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const result = await superAdminService.toggleUserStatus(req.params.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async setEstablishmentStatus(req, res, next) {
    try {
      const result = await superAdminService.setEstablishmentStatus(req.params.id, req.body.status);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SuperAdminController();
