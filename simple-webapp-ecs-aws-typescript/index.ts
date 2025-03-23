import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();

const containerPort = config.requireNumber("containerPort");
const cpu = config.requireNumber("cpu");
const memory = config.requireNumber("memory");
const imageName = config.require("imageName");
const clusterArn = config.require("clusterArn");


const loadbalancer = new awsx.lb.ApplicationLoadBalancer("loadbalancer", {});


new awsx.ecs.FargateService("service", {
    cluster: clusterArn,
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            name: "app",
            image: imageName,
            cpu: cpu,
            memory: memory,
            essential: true,
            portMappings: [{
                containerPort: containerPort,
                targetGroup: loadbalancer.defaultTargetGroup
            }],
        },
    },
});

export const url = pulumi.interpolate`http://${loadbalancer.loadBalancer.dnsName}`;
