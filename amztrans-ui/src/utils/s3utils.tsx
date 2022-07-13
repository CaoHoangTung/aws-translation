import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { REGION, BUCKET_NAME, OUTPUT_BUCKET_NAME, IDENTITY_POOL_ID, APIGATEWAY_ENDPOINT } from "../assets/config";
import axios from "axios";
import { getLocalAccessToken } from "./auth";
import { API } from "./api";

// Initialize the Amazon Cognito credentials provider
const s3 = new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID, // IDENTITY_POOL_ID
    }),
});


const getCurrentUsername = () => {
  return "public";
}
  
const getS3Workspace = () => {
  return `s3://${BUCKET_NAME}/${getCurrentUsername()}`;
}

/**
 * Get file name from path
 * Example: /a/b/c/d.png => d.png
 * @param path 
 * @returns 
 */
export const getFileNameFromPath = (path: string) => {
  const pathItems = path.split("/");
  return pathItems[pathItems.length-1];
}

export const getDownloadURL = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: OUTPUT_BUCKET_NAME,
    Key: key
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 10 });
  return url;
}

/**
 * List all translated objects under s3://[WORKSPACE]/[bucketKey]
 * @param bucketKey 
 */
export const listTranslatedFiles = async (bucketKey: string, languageCode: string) => {
  try {
    const data = await s3.send(new ListObjectsCommand({
      Bucket: OUTPUT_BUCKET_NAME,
      Prefix: `${bucketKey}/${languageCode}`
    }));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
}

/**
 * Upload file to S3
 * @param bucketKey: path to file after the workspace path
 * @param file 
 * @returns 
 */
export const uploadFile = async (bucketKey: string, file: File) => {
        const fileName = file.name;
        const fileKey = `${getCurrentUsername()}/${bucketKey}/${fileName}`;
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: file
        };
        console.log(`Uploading ${fileName} to ${BUCKET_NAME}, key=${fileKey}`);
        try {
          const data = await s3.send(new PutObjectCommand(uploadParams));
          console.log(data);
          return data;
        } catch (err) {
          return alert("There was an error uploading your photo: ", err.message);
        }
}

/**
 * Create translation job in Amazon Translate
 * @param jobName 
 * @param contentType 
 * @param sourceLang 
 * @param targetLang 
 * @param uploadId 
 * @returns 
 */
export const createTranslationJob = async (jobName:string, contentType: string, sourceLang:string, targetLang: string, uploadId: string) => {
  let inputBucketURI = `${getS3Workspace()}/${uploadId}`;
  console.log("Bucket uri", inputBucketURI);

  const data = JSON.stringify({
    body: {
        jobName: jobName,
        inputBucketURI: inputBucketURI,
        inputContentType: contentType,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
    }
  });

  return API.post(`/jobs/create`, data);
}

export const listTranslationJobs = async () => {
  return API.get("/jobs/list");
}

export const describeTranslationJob = async (jobId: string) => {
  return API.get(`/jobs/describe?jobId=${jobId}`);
}