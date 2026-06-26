import type { Attribute, Schema } from '@strapi/strapi';

export interface OrderItem extends Schema.Component {
  collectionName: 'components_order_items';
  info: {
    description: 'Snapshot de un producto comprado';
    displayName: 'Order item';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    productId: Attribute.Integer & Attribute.Required;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    subtotal: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    unitPrice: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'order.item': OrderItem;
    }
  }
}
