import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { Configuration } from '../config'

export const release = (
  config: Configuration,
  provider?: k8s.Provider,
  dependsOn?: pulumi.Resource[]
) =>
  new k8s.helm.v3.Release(
    'cerus-analytics',
    {
      name: 'cerus-analytics',
      chart: 'plausible-analytics',
      namespace: config.namespace,
      repositoryOpts: {
        repo: 'https://0xacab.org/api/v4/projects/3963/packages/helm/stable',
      },
      values: {
        disableRegistration: true,
        baseURL: `http://analytics.${config.domain}`,
        adminUser: {
          email: config.analytics.user.email,
          name: config.analytics.user.name,
          password: config.analytics.user.password,
        },
        postgresql: {
          url: `postgress://postgres:${config.analytics.postgres.password}@cerus-analytics-postgresql.${config.namespace}.svc.cluster.local:5432/plausible`,
          auth: {
            postgresPassword: config.analytics.postgres.password,
          },
          primary: {
            persistence: {
              storageClass: config.analytics.postgres.storage.class,
              size: config.analytics.postgres.storage.size,
            },
          },
        },
        clickhouse: {
          url: `http://cerus-analytics-clickhouse.${config.namespace}.svc.cluster.local:8123/plausible_events_db`,
          persistentVolumeClaim: {
            enabled: true,
            dataPersistentVolume: {
              enabled: true,
              storageClassName: config.clickhouse.data.storage.class,
              storage: config.clickhouse.data.storage.size,
            },
            logsPersistentVolume: {
              enabled: true,
              storageClassName: config.clickhouse.logs.storage.class,
              storage: config.clickhouse.logs.storage.size,
            },
          },
        },
      },
    },
    { provider, dependsOn }
  )

export const externalName = (
  config: Configuration,
  provider?: k8s.Provider,
  dependsOn?: pulumi.Resource[]
) =>
  new k8s.core.v1.Service(
    'cerus-analytics-plausible-analytics-external',
    {
      metadata: {
        name: 'cerus-analytics-plausible-analytics-external',
        namespace: config.namespace,
      },
      spec: {
        type: 'ExternalName',
        externalName: `cerus-analytics-plausible-analytics.${config.namespace}.svc.cluster.local`,
      },
    },
    { provider, dependsOn }
  )

export default function analytics(
  config: Configuration,
  provider?: k8s.Provider,
  dependsOn?: pulumi.Resource[]
) {
  dependsOn = dependsOn || []
  const releaseRes = release(config, provider, dependsOn)
  const externalNameRes = externalName(config, provider, [
    ...dependsOn,
    releaseRes,
  ])
  return [releaseRes, externalNameRes]
}
