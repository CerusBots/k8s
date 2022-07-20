import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { resolve, join } from 'path'
import { Configuration } from '../config'

export default function cert(
  config: Configuration,
  provider?: k8s.Provider,
  dependsOn?: pulumi.Resource[]
) {
  return new k8s.yaml.ConfigFile(
    (config.dev ? 'selfsigned' : 'prod') + '-cert',
    {
      file: resolve(
        join(__dirname, '..', config.dev ? 'dev' : 'prod', 'cert.yaml')
      ),
      transformations: [
        (o: any) => {
          o.metadata.namespace = config.namespace
          if (!config.dev) o.spec.acme.email = config.acme.email
        },
      ],
    },
    { provider, dependsOn }
  )
}
