import { Config, Output } from '@pulumi/pulumi'
import { parse } from 'yaml'

export interface Configuration {
  kubeConfig: any
  org: string
  name: string
  namespace: string
  dev: boolean
  mode: string
  version: string
  sha: string
  hasNamespace: boolean
  domain: string
  acme: {
    email: string
  }
  clickhouse: Record<
    'logs' | 'data',
    {
      storage: {
        class: string
        size: string
      }
    }
  >
  grafana: {
    storage: {
      class: string
      size: string
    }
  }
  analytics: {
    user: {
      email: string
      password: Output<string> | string
      name: string
    }
    postgres: {
      password: Output<string> | string
      storage: {
        class: string
        size: string
      }
    }
  }
}

export function createConfig(config: Config): Configuration {
  const name = config.get('name') || 'dev'
  const mode = config.get('mode') || 'development'
  const dev = mode === 'development'
  const namespace = config.get('namespace') || 'cerusbots'
  const org = config.get('org') || 'CerusBots'
  const version = config.get('version') || 'latest'
  const sha = config.get('sha') || 'HEAD'
  const kubeConfigRaw = config.get('kubeconfig')
  const kubeConfig = kubeConfigRaw ? parse(kubeConfigRaw) : undefined
  const domain = config.get('host') || 'cerusbots.' + (dev ? 'test' : 'com')
  const hasNamespaceRaw = config.getBoolean('hasNamespace')
  const hasNamespace =
    typeof hasNamespaceRaw === 'undefined' ? false : hasNamespaceRaw
  const storageClass = config.get('storage.class') || 'standard'

  return {
    name,
    org,
    namespace,
    kubeConfig,
    dev,
    mode,
    version,
    sha,
    domain,
    hasNamespace,
    acme: {
      email: config.get('acme.email') || `acme@${domain}`,
    },
    clickhouse: {
      data: {
        storage: {
          class: config.get('clickhouse.data.storage.class') || storageClass,
          size: config.get('clickhouse.data.storage.size') || '1Gi',
        },
      },
      logs: {
        storage: {
          class: config.get('clickhouse.logs.storage.class') || storageClass,
          size: config.get('clickhouse.logs.storage.size') || '1Gi',
        },
      },
    },
    grafana: {
      storage: {
        class: config.get('grafana.storage.class') || storageClass,
        size: config.get('grafana.storage.size') || '1Gi',
      },
    },
    analytics: {
      user: {
        email: config.get('analytics.user.email') || `analytics@${domain}`,
        password: config.getSecret('analytics.user.password') || '123456',
        name: config.get('analytics.user.name') || 'admin',
      },
      postgres: {
        password: config.getSecret('analytics.postgres.password') || '123456',
        storage: {
          class: config.get('analytics.postgres.storage.class') || storageClass,
          size: config.get('analytics.postgres.storage.size') || '1Gi',
        },
      },
    },
  }
}
