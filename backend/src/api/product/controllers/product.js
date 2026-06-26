'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const activeFilter = { isActive: { $eq: true } };

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        ...activeFilter,
      },
    };

    return super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.entityService.findOne('api::product.product', id, {
      ...ctx.query,
      filters: activeFilter,
    });

    if (!entity || !entity.isActive) {
      return ctx.notFound('Producto no encontrado');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.entityService.findOne('api::product.product', id, {
      fields: ['id', 'isActive'],
    });

    if (!entity || !entity.isActive) {
      return ctx.notFound('Producto no encontrado');
    }

    const updatedEntity = await strapi.entityService.update(
      'api::product.product',
      id,
      {
        data: { isActive: false },
      }
    );
    const sanitizedEntity = await this.sanitizeOutput(updatedEntity, ctx);

    return this.transformResponse(sanitizedEntity);
  },
}));
