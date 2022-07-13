import boto3
import json
from datetime import datetime, timedelta

translate_client = boto3.client('translate')   

def lambda_handler(event, context):
    params = event.get("queryStringParameters")

    response = translate_client.list_text_translation_jobs(
        Filter={
            'SubmittedAfterTime': datetime.today() - timedelta(days=1)
        }
    )
    jobs = response['TextTranslationJobPropertiesList']
    for idx, job in enumerate(jobs):
        job['SubmittedTime'] = job['SubmittedTime'].isoformat()
        if 'EndTime' in job:
            job['EndTime'] = job['EndTime'].isoformat()
            
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(jobs)
    }
