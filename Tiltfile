v1alpha1.extension_repo(name='default', url='file:///home/ross/tilt-extensions')
load('ext://pulumi', 'pulumi_resource')

update_settings(k8s_upsert_timeout_secs=600)

include('./packages/api/Tiltfile')
include('./packages/webapp/Tiltfile')
include('./packages/website/Tiltfile')

pulumi_resource('cerus-analytics', stack='dev', dir='deploy/pulumi', labels=['cerus'], port_forwards=['8085:8000'])