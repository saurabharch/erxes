import gql from 'graphql-tag';

import {
  queries as invoiceQueries,
  types as invoiceTypes,
  mutations as invoiceMutations,
} from './schema/invoices';

import {
  queries as paymentQueries,
  types as paymentTypes,
  mutations as paymentMutations,
} from './schema/payments';

import {
  queries as configsQueries,
  mutations as configsMutations,
  types as configsTypes,
} from './schema/paymentConfigs';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
    
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
    
    ${invoiceTypes}
    ${paymentTypes}
    ${configsTypes}

    
    extend type Query {
      ${invoiceQueries}
      ${paymentQueries}
      ${configsQueries}
    }
    
    extend type Mutation {
      ${paymentMutations}
      ${configsMutations}
      ${invoiceMutations}
    }
  `;
};

export default typeDefs;
