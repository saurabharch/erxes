import * as serverTiming from 'server-timing';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporterByUrl';
import segments from './segments';
import forms from './forms';
import logs from './logUtils';
import { generateModels } from './connectionResolver';
import imports from './imports';
import internalNotes from './internalNotes';
import automations from './automations';
import search from './search';
import webhooks from './webhooks';
import documents from './documents';
import tags from './tags';
import exporter from './exporter';
import cronjobs from './cronjobs/common';
import dashboards from './dashboards';
import payment from './payment';
import reports from './reports';
import app from '@erxes/api-utils/src/app';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';
import { NOTIFICATION_MODULES } from './constants';

export default {
  name: 'cards',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),

  meta: {
    cronjobs,
    reports,
    forms,
    logs: { providesActivityLog: true, consumers: logs },
    segments,
    automations,
    imports,
    exporter,
    internalNotes,
    search,
    webhooks,
    tags,
    permissions,
    documents,
    dashboards,
    notificationModules: NOTIFICATION_MODULES,
    payment,
  },

  apolloServerContext: async (context, req, res) => {
    const { subdomain } = context;
    context.models = await generateModels(subdomain);

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],
  onServerInit: async () => {
    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomainHeader(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );

    console.log('Debug ....');
  },
  setupMessageConsumers,
};
