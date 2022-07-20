import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { Configuration } from '../config'

export default function ingress(
  config: Configuration,
  provider?: k8s.Provider,
  dependsOn?: pulumi.Resource[]
) {
  return new k8s.networking.v1.Ingress(
    'cerus-ingress',
    {
      metadata: {
        name: 'cerus-ingress',
        namespace: config.namespace,
        annotations: {
          'cert-manager.io/cluster-issuer':
            (config.dev ? 'selfsigned' : 'prod') + '-cluster-issuer',
          ...(config.dev ? {} : { 'kubernetes.io/ingress.class': 'nginx' }),
        },
      },
      spec: {
        ingressClassName: 'nginx',
        tls: [
          {
            hosts: [
              config.domain,
              `app.${config.domain}`,
              `analytics.${config.domain}`,
              `api.${config.domain}`,
            ],
            secretName: config.dev
              ? 'selfsigned-root-secret'
              : 'letsencrypt-prod',
          },
        ],
        rules: [
          {
            host: config.domain,
            http: {
              paths: [
                {
                  pathType: 'Prefix',
                  path: '/',
                  backend: {
                    service: {
                      name: 'cerus-website',
                      port: {
                        number: 3000,
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            host: `app.${config.domain}`,
            http: {
              paths: [
                {
                  pathType: 'Prefix',
                  path: '/',
                  backend: {
                    service: {
                      name: 'cerus-webapp',
                      port: {
                        number: 8080,
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            host: `analytics.${config.domain}`,
            http: {
              paths: [
                {
                  pathType: 'Prefix',
                  path: '/',
                  backend: {
                    service: {
                      name: 'cerus-analytics-plausible-analytics',
                      port: {
                        number: 8000,
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            host: `api.${config.domain}`,
            http: {
              paths: [
                {
                  pathType: 'Prefix',
                  path: '/',
                  backend: {
                    service: {
                      name: 'cerus-api',
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { provider, dependsOn }
  )
}
