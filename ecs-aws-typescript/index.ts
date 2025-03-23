import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();

const containerPort = config.requireNumber("containerPort");
const cpu = config.requireNumber("cpu")
const memory = config.requireNumber("memory")

// An ECS cluster to deploy into
const cluster = new aws.ecs.Cluster("cluster", {});

// An ALB to serve the container endpoint to the internet
const loadbalancer = new awsx.lb.ApplicationLoadBalancer("loadbalancer", {});

export const clusterArn = cluster.arn;
export const loadBalancerDefaultTargetGroup = loadbalancer.defaultTargetGroup;
