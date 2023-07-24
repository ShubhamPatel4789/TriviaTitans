import json
import boto3

def lambda_handler(event, context):
    sqs = boto3.client('sqs')
    queue_url = 'https://sqs.us-east-1.amazonaws.com/000966082997/InvitationQueue'  

    while True:
        response = sqs.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20  # Wait for 20 seconds to receive messages
        )

        messages = response.get('Messages', [])
        if not messages:
            print("No messages found in the queue.")
            break

        for message in messages:
            try:
                # print(message)
                body = json.loads(message['Body'])
                team_name = body.get('teamName')
                email = body.get('email')

                print(f"Received message - Team Name: {team_name}, Email: {email}")

                # Add your processing logic here, e.g., sending an email, updating the database, etc.

                # Delete the processed message from the queue
                
                # receipt_handle = message['ReceiptHandle']
                # sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)

            except Exception as e:
                print(f"Error processing message: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps('Queue processing completed.')
    }
