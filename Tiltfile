load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://deployment', 'service_yaml')
load('ext://dotenv', 'dotenv')

dotenv()

k8s_yaml('./kube/namespace.yml')
k8s_yaml('./kube/ingress.yml')
k8s_yaml('./kube-dev/ingress.yml')

include('./packages/api/Tiltfile')
include('./packages/webapp/Tiltfile')
include('./packages/website/Tiltfile')

helm_repo('varac', 'https://0xacab.org/api/v4/projects/3963/packages/helm/stable', labels=['cerus-helm'])

helm_resource('analytics', 'varac/plausible-analytics', labels=['cerus-monitoring'], namespace='cerusbots', flags=[
    '--set', 'disabelRegistration=true',
    '--set', 'baseURL=http://analytics.cerusbots.test',
    '--set', 'postgresql.url=postgress://postgres:' + os.getenv('PLAUSIBLE_POSTGRESS_PASSWORD') + '@analytics-postgresql.cerusbots.svc.cluster.local:5432/plausible',
    '--set', 'postgresql.auth.postgresPassword=' + os.getenv('PLAUSIBLE_POSTGRESS_PASSWORD'),
    '--set', 'clickhouse.url=http://analytics-clickhouse.cerusbots.svc.cluster.local:8123/plausible_events_db'
])
k8s_resource('analytics', port_forwards=['8085:8000'])

k8s_yaml(service_yaml('analytics-plausible-analytics-external', 'ExternalName', external_name='analytics-plausible-analytics.cerusbots.svc.cluster.local', namespace='cerusbots'))