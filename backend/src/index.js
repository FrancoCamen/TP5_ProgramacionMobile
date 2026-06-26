'use strict';

const permissionsByRole = {
  public: [
    'api::product.product.find',
    'api::product.product.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::brand.brand.find',
    'api::brand.brand.findOne',
  ],
  authenticated: [
    'api::product.product.find',
    'api::product.product.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::brand.brand.find',
    'api::brand.brand.findOne',
    'api::favorite.favorite.find',
    'api::favorite.favorite.create',
    'api::favorite.favorite.delete',
    'api::order.order.find',
    'api::order.order.create',
  ],
};

async function configurePermissions(strapi) {
  for (const [roleType, actions] of Object.entries(permissionsByRole)) {
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: roleType } });

    if (!role) {
      strapi.log.warn(`No se encontró el rol ${roleType}`);
      continue;
    }

    for (const action of actions) {
      const permission = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { role: role.id, action } });

      if (!permission) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            role: role.id,
            action,
          },
        });
      }
    }
  }
}

async function seedDatabase(strapi) {
  if (process.env.SEED_DATABASE === 'false') {
    return;
  }

  const productCount = await strapi.db.query('api::product.product').count();

  if (productCount > 0) {
    return;
  }

  const categories = {};
  const brands = {};

  for (const category of [
    { name: 'Notebooks', slug: 'notebooks' },
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Accesorios', slug: 'accesorios' },
  ]) {
    categories[category.slug] = await strapi.entityService.create(
      'api::category.category',
      { data: category }
    );
  }

  for (const brand of ['Apple', 'Lenovo', 'Samsung', 'Logitech']) {
    brands[brand] = await strapi.entityService.create('api::brand.brand', {
      data: { name: brand },
    });
  }

  const products = [
    {
      name: 'MacBook Air M2',
      description: 'Notebook liviana con chip Apple M2 y pantalla Liquid Retina.',
      price: 1499999.99,
      discount: 10,
      stock: 8,
      specs: { ram: '8 GB', storage: '256 GB SSD', screen: '13.6 pulgadas' },
      category: categories.notebooks.id,
      brand: brands.Apple.id,
    },
    {
      name: 'Lenovo ThinkPad E14',
      description: 'Notebook empresarial robusta para productividad diaria.',
      price: 1099999.99,
      stock: 12,
      specs: { ram: '16 GB', storage: '512 GB SSD', processor: 'Intel Core i5' },
      category: categories.notebooks.id,
      brand: brands.Lenovo.id,
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Smartphone con cámara avanzada y pantalla AMOLED.',
      price: 1299999.99,
      discount: 5,
      stock: 15,
      specs: { storage: '256 GB', screen: '6.2 pulgadas', network: '5G' },
      category: categories.smartphones.id,
      brand: brands.Samsung.id,
    },
    {
      name: 'Logitech MX Master 3S',
      description: 'Mouse inalámbrico ergonómico de alta precisión.',
      price: 149999.99,
      stock: 25,
      specs: { connectivity: 'Bluetooth / Logi Bolt', dpi: 8000 },
      category: categories.accesorios.id,
      brand: brands.Logitech.id,
    },
  ];

  for (const product of products) {
    await strapi.entityService.create('api::product.product', {
      data: {
        ...product,
        isActive: true,
      },
    });
  }

  strapi.log.info('Datos de prueba cargados correctamente');
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    await configurePermissions(strapi);
    await seedDatabase(strapi);
  },
};
