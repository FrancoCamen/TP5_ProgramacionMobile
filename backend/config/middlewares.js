'use strict';

module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  {
    name: 'strapi::favicon',
    config: {
      path: 'node_modules/@strapi/generate-new/dist/resources/files/js/favicon.png',
    },
  },
  'strapi::public',
];
