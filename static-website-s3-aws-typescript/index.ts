import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";
import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";

// Generate a random string
const randomString = new random.RandomString("random", {
    length: 6,
    special: false,
    upper: false,
});

// Create an S3 bucket
const bucket = new aws.s3.BucketV2("bucket", {
    bucket: pulumi.interpolate`revbucket-${randomString.result}`,
    forceDestroy: true,
});

// Configure the bucket as a website
const bucketWebsiteConfig = new aws.s3.BucketWebsiteConfigurationV2("websiteConfig", {
    bucket: bucket.id,
    indexDocument: {
        suffix: "index.html",
    },
    errorDocument: {
        key: "error.html",
    },
});

const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("publicAccessBlock", {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
});

// Upload files to the bucket
const htmlDir = path.join(__dirname, "html");
const files = fs.readdirSync(htmlDir);
const uploads = files.map(file => {
    return new aws.s3.BucketObject(file, {
        bucket: bucket.id,
        key: file,
        source: new pulumi.asset.FileAsset(path.join(htmlDir, file)),
        contentType: "text/html",
    });
});

// Apply bucket policy
const bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: bucket.id,
    policy: bucket.id.apply(id => JSON.stringify({
        Version: "2012-10-17",
        Id: "Policy1234567890123",
        Statement: [{
            Sid: "Stmt1234567890123",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${id}/*`,
        }],
    })),
});

// Export the website URL
export const websiteUrl = bucketWebsiteConfig.websiteEndpoint;
