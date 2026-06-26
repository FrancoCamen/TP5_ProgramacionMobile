'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::favorite.favorite', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes iniciar sesión');
    }

    const query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: { id: { $eq: user.id } },
      },
      populate: ctx.query.populate || {
        product: {
          populate: ['images', 'category', 'brand'],
        },
      },
    };

    const { results, pagination } = await strapi
      .service('api::favorite.favorite')
      .find(query);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },

  async create(ctx) {
    const user = ctx.state.user;
    const productId = Number(ctx.request.body?.data?.product);

    if (!user) {
      return ctx.unauthorized('Debes iniciar sesión');
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return ctx.badRequest('Debes indicar un producto válido');
    }

    const product = await strapi.entityService.findOne(
      'api::product.product',
      productId,
      { fields: ['id', 'isActive'] }
    );

    if (!product || !product.isActive) {
      return ctx.notFound('Producto no encontrado');
    }

    const existing = await strapi.db.query('api::favorite.favorite').findOne({
      where: {
        user: user.id,
        product: productId,
      },
    });

    if (existing) {
      return ctx.conflict('El producto ya está en favoritos');
    }

    const favorite = await strapi.entityService.create(
      'api::favorite.favorite',
      {
        data: {
          user: user.id,
          product: productId,
        },
        populate: {
          product: {
            populate: ['images', 'category', 'brand'],
          },
        },
      }
    );
    const sanitizedEntity = await this.sanitizeOutput(favorite, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const favoriteId = Number(ctx.params.id);

    if (!user) {
      return ctx.unauthorized('Debes iniciar sesión');
    }

    const favorite = await strapi.db.query('api::favorite.favorite').findOne({
      where: {
        id: favoriteId,
        user: user.id,
      },
    });

    if (!favorite) {
      return ctx.notFound('Favorito no encontrado');
    }

    return super.delete(ctx);
  },
}));
