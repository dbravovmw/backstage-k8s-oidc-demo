import { KubernetesBackendClient, kubernetesApiRef, kubernetesAuthProvidersApiRef, KubernetesAuthProviders, Router } from '@backstage/plugin-kubernetes';
import {
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
  googleAuthApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { auth0ApiRef } from '../../apis';

const rootCatalogKubernetesRouteRef = createRouteRef({
  id: 'kubernetes',
});

const kubernetesPlugin = createPlugin({
  id: 'kubernetes',
  apis: [
    createApiFactory({
      api: kubernetesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new KubernetesBackendClient({ discoveryApi, identityApi }),
    }),
    createApiFactory({
      api: kubernetesAuthProvidersApiRef,
      deps: {
        auth0AuthApi: auth0ApiRef,
        googleAuthApi: googleAuthApiRef,
      },
      factory: ({ auth0AuthApi, googleAuthApi }) => {
        const oidcProviders = {
          auth0: auth0AuthApi,
          google: googleAuthApi,
        };

        return new KubernetesAuthProviders({ googleAuthApi, oidcProviders });
      },
    }),
  ],
  routes: {
    entityContent: rootCatalogKubernetesRouteRef,
  },
});

export const ExtendedEntityKubernetesContent = kubernetesPlugin.provide(
  createRoutableExtension({
    name: 'EntityKubernetesContent',
    component: () => Promise.resolve(Router),
    mountPoint: rootCatalogKubernetesRouteRef,
  }),
);
