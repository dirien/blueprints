import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";

const config = new pulumi.Config();

const doCluster = new digitalocean.KubernetesCluster("do-cluster", {
    region: config.require("region"),
    version: config.require("version"),
    destroyAllAssociatedResources: true,
    nodePool: {
        name: "default",
        size: config.require("nodeSize"),
        nodeCount: config.requireNumber("nodeCount"),
    },
});

const k8sProvider = new kubernetes.Provider("do-k8s", {
    kubeconfig: doCluster.kubeConfigs[0].rawConfig,
});

new kubernetes.helm.v3.Release("ingress-nginx", {
    chart: "ingress-nginx",
    repositoryOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx"
    },
    namespace: "nginx",
    createNamespace: true,
    values: {
        controller: {
            publishService: {
                enabled: true
            }
        }
    }
}, {provider: k8sProvider});

new kubernetes.helm.v3.Release("argocd", {
    chart: "argo-cd",
    version: "7.8.13",
    repositoryOpts: {
        repo: "https://argoproj.github.io/argo-helm"
    },
    namespace: "argo",
    createNamespace: true,
    values: {
        configs: {
            secret: {
                argocdServerAdminPassword: "$2a$10$m3eTlEdRen0nS86c5Zph5u/bDFQMcWZYdG3NVdiyaACCqoxLJaz16",
                argocdServerAdminPasswordMtime: "2021-11-08T15:04:05Z"
            },
            cm: {
                "application.resourceTrackingMethod": "annotation",
                "accounts.admin": "apiKey, login"
            },
            params: {
                "server.insecure": true
            }
        }
    }
}, {provider: k8sProvider});

export const name = doCluster.name;
export const kubeconfig =  doCluster.kubeConfigs[0].rawConfig;

