
/**
 * Tenant isolation middleware.
 * Ensures establishment_admin users can only access their own establishment.
 * Attaches req.establishmentId for downstream use.
 *
 * Requires :establishmentId param or req.body.establishment_id.
 */
const tenantMiddleware = async (req, res, next) => {
  const { role, establishmentId: adminEstablishmentId } = req.user;

  if (role === 'super_admin') {
    // Super admin has no tenant restriction
    const id = req.params.establishmentId || req.body.establishment_id;
    req.establishmentId = id || null;
    return next();
  }

  if (role === 'establishment_admin') {
    const requestedId = req.params.establishmentId || req.body.establishment_id;

    if (requestedId && requestedId !== adminEstablishmentId) {
      return res.status(403).json({ error: 'Acesso negado ao estabelecimento.' });
    }

    req.establishmentId = adminEstablishmentId;
    return next();
  }

  if (role === 'customer') {
    const requestedId = req.params.establishmentId || req.body.establishment_id;
    req.establishmentId = requestedId || null;
    return next();
  }

  return res.status(403).json({ error: 'Role não reconhecida.' });
};

module.exports = tenantMiddleware;
