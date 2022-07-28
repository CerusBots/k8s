import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { Configuration } from './config'

import analytics from './components/analytics'
import cert from './components/cert'
import grafana from './components/grafana'
import ingress from './components/ingress'
import namespace from './components/namespace'
import prometheus from './components/prometheus'

export function createKube(config: Configuration, provider?: k8s.Provider) {
  const dependsOn: pulumi.Resource[] = []
  if (!config.hasNamespace) dependsOn.push(namespace(config, provider))
  const prometheusRes = prometheus(config, provider, dependsOn)
  const grafanaRes = grafana(config, provider, [...dependsOn, ...prometheusRes])
  const analyticsRes = analytics(config, provider, dependsOn)
  const certRes = cert(config, provider, dependsOn)
  const ingressRes = ingress(config, provider, [
    ...dependsOn,
    ...analyticsRes,
    certRes,
  ])
  return [...dependsOn, ...analyticsRes, ingressRes, prometheusRes, grafanaRes]
}
