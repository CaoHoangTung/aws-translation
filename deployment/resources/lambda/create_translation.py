import boto3
import json

ssm_client = boto3.client('ssm')

S3_OUTPUT_BUCKET = ssm_client.get_parameter(Name='/amztrans/lambda/s3-output-bucket')['Parameter']['Value']
DATA_ACCESS_ROLE_ARN = ssm_client.get_parameter(Name='/amztrans/lambda/data-access-role-arn')['Parameter']['Value']

translation_client = boto3.client('translate')    

def lambda_handler(event, context):
    params = event.get("body")

    job_name = params.get('jobName')
    s3_input_uri = params.get('inputBucketURI')
    s3_path = "/".join(s3_input_uri[5:].split('/')[1:])
        
    s3_input_content_type = params.get('inputContentType')
         
    s3_output_uri = f's3://{S3_OUTPUT_BUCKET}/{s3_path}'
        
    source_lang = params.get('sourceLanguage')
    target_lang = params.get('targetLanguage')
        
    response = translation_client.start_text_translation_job(
        JobName=job_name,
        InputDataConfig={
            'S3Uri': s3_input_uri,
            'ContentType': s3_input_content_type
        },
        OutputDataConfig={
            'S3Uri': s3_output_uri
        },
        DataAccessRoleArn=DATA_ACCESS_ROLE_ARN,
        SourceLanguageCode=source_lang,
        TargetLanguageCodes=[
            target_lang,
        ]
    )
        
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'response': response
    }
