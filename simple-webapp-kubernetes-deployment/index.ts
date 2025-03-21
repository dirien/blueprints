import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const appLabels = {app: config.require("name"),};

const ns = new k8s.core.v1.Namespace(config.require("name"), {})

const deployment = new k8s.apps.v1.Deployment(config.require("name"), {
    metadata: {
        namespace: ns.metadata.name,
    },
    spec: {
        selector: {
            matchLabels: appLabels
        },
        replicas: 1,
        template: {
            metadata: {
                labels: appLabels
            },
            spec: {
                containers: [
                    {
                        name: config.require("name"),
                        image: config.require("image"),
                    }
                ]
            }
        }
    }
});

const service = new k8s.core.v1.Service(config.require("name"), {
    metadata: {
        labels: deployment.spec.template.metadata.labels,
        namespace: ns.metadata.name,
    },
    spec: {
        selector: appLabels,
        ports: [
            {
                port: 8080,
                targetPort: 80,
            }
        ],
        type: config.require("public") == "true" ? "LoadBalancer" : "ClusterIP"
    }
});


export const url = pulumi.interpolate`http://${service.status.loadBalancer.ingress[0].ip}:${service.spec.ports[0].port}`;
