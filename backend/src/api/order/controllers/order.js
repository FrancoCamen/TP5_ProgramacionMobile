'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
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
      sort: ctx.query.sort || ['createdAt:desc'],
      populate: ctx.query.populate || ['items'],
    };

    const { results, pagination } = await strapi
      .service('api::order.order')
      .find(query);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },

  async create(ctx) {
    const user = ctx.state.user;
    const requestedItems = ctx.request.body?.data?.items;

    if (!user) {
      return ctx.unauthorized('Debes iniciar sesión');
    }

    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      return ctx.badRequest('La orden debe contener al menos un producto');
    }

    const quantities = new Map();

    for (const item of requestedItems) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return ctx.badRequest('Cada item debe tener productId y quantity válidos');
      }

      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    try {
      const order = await strapi.db.transaction(async () => {
        const snapshots = [];
        let total = 0;

        for (const [productId, quantity] of quantities.entries()) {
          const product = await strapi.db.query('api::product.product').findOne({
            where: { id: productId, isActive: true },
          });

          if (!product) {
            throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
          }

          if (product.stock < quantity) {
            throw new Error(`INSUFFICIENT_STOCK:${product.name}:${product.stock}`);
          }

          const price = Number(product.price);
          const discount = Number(product.discount || 0);
          const unitPrice = roundMoney(price * (1 - discount / 100));
          const subtotal = roundMoney(unitPrice * quantity);

          snapshots.push({
            productId: product.id,
            name: product.name,
            unitPrice,
            quantity,
            subtotal,
          });
          total = roundMoney(total + subtotal);

          await strapi.db.query('api::product.product').update({
            where: { id: product.id },
            data: { stock: product.stock - quantity },
          });
        }

        return strapi.entityService.create('api::order.order', {
          data: {
            user: user.id,
            items: snapshots,
            total,
            status: 'pending',
          },
          populate: ['items'],
        });
      });

      const sanitizedEntity = await this.sanitizeOutput(order, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
        return ctx.notFound('Uno de los productos no existe o está inactivo');
      }

      if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
        const [, name, available] = error.message.split(':');
        return ctx.badRequest(`Stock insuficiente para ${name}. Disponible: ${available}`);
      }

      strapi.log.error(`No se pudo crear la orden: ${error.stack || error.message}`);
      return ctx.internalServerError('No se pudo crear la orden');
    }
  },
}));
