import boto3
import json

translation_client = boto3.client('translate')   

def lambda_handler(event, context):
    params = event.get("queryStringParameters")

    jobId = params.get("jobId")
    response = translation_client.describe_text_translation_job(
        JobId=jobId
    )
    job = response['TextTranslationJobProperties']
    job['SubmittedTime'] = job['SubmittedTime'].isoformat()
    
    if 'EndTime' in job:
        job['EndTime'] = job['EndTime'].isoformat()
    response = job
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response)
    }
