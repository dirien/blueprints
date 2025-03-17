import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const doCluster = new digitalocean.KubernetesCluster("do-cluster", {
    region: config.require("region"),
    version: config.require("version"),
    destroyAllAssociatedResources: true,
    nodePool: {
        name: "default",
        size: "s-2vcpu-2gb",
        nodeCount: config.requireNumber("nodeCount"),
    },
});
export const name = doCluster.name;
export const kubeconfig = doCluster.kubeConfigs.apply(kubeConfigs => kubeConfigs[0].rawConfig);
