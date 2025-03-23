import * as aws from "@pulumi/aws";

// An ECS cluster to deploy into
const cluster = new aws.ecs.Cluster("cluster", {});


export const clusterArn = cluster.arn;
