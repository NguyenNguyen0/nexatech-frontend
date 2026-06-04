import { ExternalLink, Gauge, LineChart, Server } from 'lucide-react'

import { Layout } from '@/components/custom/layout'
import { Button } from '@/components/custom/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const grafanaUrl = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3005'
const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090'
const grafanaDashboardUrl = `${grafanaUrl.replace(/\/$/, '')}/d/nexatech-overview/nexatech-microservices-overview?orgId=1&refresh=15s&kiosk`

const services = [
  {
    name: 'Grafana',
    description: 'Dashboard quan sát metrics, logs và alert cho hệ thống NexaTech.',
    url: grafanaDashboardUrl,
    icon: Gauge,
  },
  {
    name: 'Prometheus',
    description: 'Prometheus UI để query PromQL, kiểm tra targets và scrape status.',
    url: prometheusUrl,
    icon: LineChart,
  },
]

function MonitoringFrame({ title, url }: { title: string; url: string }) {
  return (
    <Card className="min-h-0 flex-1">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{url}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-[680px] p-0">
        <iframe
          title={title}
          src={url}
          className="h-[calc(100vh-18rem)] min-h-[680px] w-full border-0 bg-background"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </CardContent>
    </Card>
  )
}

export default function MonitoringPage() {
  return (
    <Layout fixed>
      <Layout.Body className="min-h-0 overflow-y-auto md:overflow-y-auto">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Monitoring</h1>
            <p className="text-sm text-muted-foreground">Grafana và Prometheus cho môi trường local.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {service.name}
                  </CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <code className="rounded bg-muted px-2 py-1 text-xs">{service.url}</code>
                    <Button asChild variant="outline" size="sm">
                      <a href={service.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="grafana" className="min-h-0 space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="grafana">
                <Gauge className="h-4 w-4" />
                Grafana
              </TabsTrigger>
              <TabsTrigger value="prometheus">
                <LineChart className="h-4 w-4" />
                Prometheus
              </TabsTrigger>
              <TabsTrigger value="targets">
                <Server className="h-4 w-4" />
                Prometheus targets
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grafana">
            <MonitoringFrame title="Grafana" url={grafanaDashboardUrl} />
          </TabsContent>
          <TabsContent value="prometheus">
            <MonitoringFrame title="Prometheus" url={prometheusUrl} />
          </TabsContent>
          <TabsContent value="targets">
            <MonitoringFrame title="Prometheus targets" url={`${prometheusUrl.replace(/\/$/, '')}/targets`} />
          </TabsContent>
        </Tabs>
      </Layout.Body>
    </Layout>
  )
}
