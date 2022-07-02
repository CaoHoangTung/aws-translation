/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
ABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),
which is available at https://github.com/aws/aws-sdk-js-v3. This example is in the "AWS SDK for JavaScript v3 Developer Guide" at
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html.
Purpose:
s3_PhotoExample.js demonstrates how to manipulate photos in albums stored in an Amazon S3 bucket.
Inputs (replace in code):
- BUCKET_NAME
- REGION
- IDENTITY_POOL_ID
Running the code:
node s3_PhotoExample.js
*/
// snippet-start:[s3.JavaScript.photoAlbumExample.completeV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.configV3]
// Load the required clients and packages

import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"
import { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { Translate } from "aws-sdk";
import { REGION, BUCKET_NAME, IDENTITY_POOL_ID, APIGATEWAY_ENDPOINT } from "../assets/config";
import axios from "axios";

// Initialize the Amazon Cognito credentials provider
const s3 = new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID, // IDENTITY_POOL_ID
    }),
});

const translate = new Translate({
  region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID, // IDENTITY_POOL_ID
    }),
  });

// List the photo albums that exist in the bucket
export const listAlbums = async () => {
  try {
      console.log("GETTING DATA");
    const data = await s3.send(
        new ListObjectsCommand({ Delimiter: "/", Bucket: BUCKET_NAME })
    );
    console.log(data);

  } catch (err) {
    return alert("There was an error listing your albums: " + err.message);
  }
}

/**
 * Upload file to S3
 */
export const uploadFile = async (bucketKey: string, file: File) => {
        const fileName = file.name;
        const fileKey = `${bucketKey}/${fileName}`;
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: file
        };
        console.log(`Uploading ${fileName} to ${BUCKET_NAME}, key=${fileKey}`);
        try {
          const data = await s3.send(new PutObjectCommand(uploadParams));
          console.log(data);
        } catch (err) {
          return alert("There was an error uploading your photo: ", err.message);
        }
}

export const createTranslationJob = async (jobName:string, contentType: string, sourceLang:string, targetLang: string, uploadId: string) => {
  let inputBucketURI = `s3://${BUCKET_NAME}/${uploadId}`;
  console.log("Bucket uri", inputBucketURI);

  const data = JSON.stringify({
    body: {
        action: "create",
        jobName: jobName,
        inputBucketURI: inputBucketURI,
        inputContentType: contentType,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
    }
  });

  const config = {
    method: "post",
    url: `${APIGATEWAY_ENDPOINT}/jobs/create`,
    headers: {
      "Content-Type": "text/plain"
    },
    data : data
  };

  return axios(config)
}

export const describeTranslationJob = async (jobId: string) => {
  const config = {
    method: "get",
    url: `${APIGATEWAY_ENDPOINT}/jobs/describe?jobId=${jobId}&action=describe`,
  };

  return axios(config);
}