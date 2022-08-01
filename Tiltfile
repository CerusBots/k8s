v1alpha1.extension_repo(name='default', url='file:///home/ross/tilt-extensions')
load('ext://pulumi', 'pulumi_resource')
load('ext://cert_manager', 'deploy_cert_manager')

deploy_cert_manager()
update_settings(k8s_upsert_timeout_secs=600)

include('./packages/api/Tiltfile')
include('./packages/runner/Tiltfile')
include('./packages/webapp/Tiltfile')
include('./packages/website/Tiltfile')

pulumi_resource('cerus-analytics-plausible-analytics', stack='CerusBots/k8s/dev', dir='deploy/pulumi', labels=['cerus'], port_forwards=['8080:8000'])

k8s_resource('cerus-api', resource_deps=['cerus-runner'])
k8s_resource('cerus-runner', resource_deps=['cerus-analytics-plausible-analytics'])
k8s_resource('cerus-webapp', resource_deps=['cerus-api'])
k8s_resource('cerus-website', resource_deps=['cerus-analytics-plausible-analytics'])