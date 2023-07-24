import json
import boto3

sqs = boto3.client('sqs')
ses = boto3.client('ses')
sns = boto3.client('sns')
    
def lambda_handler(event, context):
    queue_url = 'https://sqs.us-east-1.amazonaws.com/000966082997/InvitationQueue'  
    topic_arn = 'arn:aws:sns:us-east-1:000966082997:TeamInvitationV3'

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
                body = json.loads(message['Body'])
                team_name = body.get('teamName')
                email = body.get('email')

                print(f"Received message - Team Name: {team_name}, Email: {email}")

                # Send email using Amazon SES
                subject = f'Invitation to Join Team: {team_name}'
                invitation_message = generate_invitation_message(email, team_name)

                # Fetch all the SNS topics and find the Topic ARN for the topic matching the name
                topics = sns.list_topics()['Topics']
                topic_name = f"Team_{team_name}_SNS"
                topic_arn = next((topic['TopicArn'] for topic in topics if topic_name in topic['TopicArn']), None)

                if topic_arn:
                    # If the topic exists, publish the message to the topic
                    sns.publish(
                        TopicArn=topic_arn,
                        Message=invitation_message,
                        Subject=subject
                    )
                    print(f"Message published to SNS topic: {topic_name}")
                else:
                    print(f"SNS topic '{topic_name}' does not exist.")

                # Delete the processed message from the queue
                # receipt_handle = message['ReceiptHandle']
                # sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)

            except Exception as e:
                print(f"Error processing message: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps('Queue processing completed.')
    }


        
def list_subscriptions(response, email):
    # print("inside")
    target_arn = None
    for subscription in response['Subscriptions']:
        if subscription['Protocol'] == 'email' and subscription['Endpoint'] == email:
            target_arn = subscription['SubscriptionArn']
            break

    # Publish a message directly to the specific email address  
    if target_arn!=None:
        print(target_arn,">>>")
        message = 'This is a direct message to a specific email address.'
        subject = 'Direct Message from SNS'
        response = sns.publish(
            TargetArn=target_arn,
            Message=message,
            Subject=subject
        )
        print(f'Message published to {email_address} with MessageId: {response["MessageId"]}')
    else:
        print(f'{email_address} is not subscribed to the SNS topic.')
        
        
def generate_invitation_message(email, team_name):
    user_name = email.split('@')[0]
    message = f"Dear {user_name},\n\n"
    message += "We are excited to invite you to join our team! We believe your skills and expertise will greatly contribute to our success.\n\n"
    # message += "To accept the invitation and become a member of our team, please click the 'Confirm Subscription' link.\n\n"
    message += "We look forward to having you on board!\n\n"
    message += "Best regards,\n"
    message += f"Team {team_name}"

    return message

# def send_email_ses(to_email, subject, body):
#     ses = boto3.client('ses', region_name='us-east-1')

#     try:
#         response = ses.send_email(
#             Source="vikramvenkatapathi@gmail.com",
#             Destination={
#                 'ToAddresses': [to_email]
#             },
#             Message={
#                 'Subject': {
#                     'Data': subject
#                 },
#                 'Body': {
#                     'Text': {
#                         'Data': body
#                     }
#                 }
#             }
#         )
#         print(f"Email sent to: {to_email}")
#         return True
#     except Exception as e:
#         print(f"Error sending email: {str(e)}")
#         return False


