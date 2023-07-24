import json
import boto3

sqs = boto3.client('sqs')
sns = boto3.client('sns')
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    queue_url = 'https://sqs.us-east-1.amazonaws.com/000966082997/InvitationQueue'

    try:
        response = sqs.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20  # Wait for 20 seconds to receive messages
        )
    
        messages = response.get('Messages', [])
        if not messages:
            print("No messages found in the queue.")
            return {
                'statusCode': 200,
                'body': json.dumps('No messages found in the queue.')
            }
    
        message = messages[0]  # Since only one message is expected
    
        try:
            body = json.loads(message['Body'])
            team_name = body.get('teamName')
            topic_arn = get_team_name_topic_ARN(team_name)
            print(f"Received message - Team Name: {team_name}")
    
            # Fetch confirmed subscription status for the team from DynamoDB
            confirmed_subscription = get_confirmed_subscription_status(team_name)
            print("Status: ",confirmed_subscription)
    
            if confirmed_subscription:
                invitation_message = generate_invitation_message(" ", team_name)
                sns.publish(
                    TopicArn=topic_arn,
                    Message=invitation_message,
                    Subject=f'Invitation to Join Team: {team_name}'
                )
                print(f"Invitation sent to {team_name}")    
            #     for email, status in confirmed_subscription.items():
            #         if not status:
            #         #     # Send email invitation for members with status False
            #             invitation_message = generate_invitation_message(" ", team_name)
            #             sns.publish(
            #                 TopicArn=topic_arn,
            #                 Message=invitation_message,
            #                 Subject=f'Invitation to Join Team: {team_name}'
            #             )
            #             print(f"Invitation sent to {email}")              
                # invitation_message = generate_invitation_message(" ", team_name)
                # sns.publish(
                #     TopicArn=topic_arn,
                #     Message=invitation_message,
                #     Subject=f'Invitation to Join Team: {team_name}'
                # )
                # print(f"Invitation sent to {team_name}")                
    
            # # Delete the processed message from the queue
            # receipt_handle = message['ReceiptHandle']
            # sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
    
        except Exception as e:
            print(f"Error processing message: {str(e)}")
    
        return {
            'statusCode': 200,
            'body': json.dumps('Queue processing completed.')
        }
    
    except Exception as e:
        print(f"Error receiving messages: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error receiving messages.')
        }

def get_team_name_topic_ARN(team_name):
    # Fetch all the SNS topics and find the Topic ARN for the topic matching the name
    topics = sns.list_topics()['Topics']
    topic_name = f"Team_{team_name}_SNS"
    topic_arn = next((topic['TopicArn'] for topic in topics if topic_name in topic['TopicArn']), None)
    return topic_arn
    
def get_confirmed_subscription_status(team_name):
    response = dynamodb.get_item(
        TableName='Teams',
        Key={'teamName': {'S': team_name}},
        ProjectionExpression='ConfirmedSubscription'
    )

    item = response.get('Item', {})
    confirmed_subscription = item.get('ConfirmedSubscription', {})
    print("confirmed_subscription: ",confirmed_subscription)
    
    # Check if all members have confirmed subscriptions (True)
    all_confirmed = all(status for status in confirmed_subscription.values())
    
    return all_confirmed

def get_confirmed_subscription(team_name):
    response = dynamodb.get_item(
        TableName='Teams',
        Key={'teamName': {'S': team_name}},
        ProjectionExpression='ConfirmedSubscription'
    )

    item = response.get('Item', {})
    confirmed_subscription = item.get('ConfirmedSubscription', {})
    return confirmed_subscription


def generate_invitation_message(email, team_name):
    user_name = email.split('@')[0]
    message = f"Dear Potential Member,\n\n"
    message += "We are excited to invite you to join our team! We believe your skills and expertise will greatly contribute to our success.\n\n"
    # message += "To accept the invitation and become a member of our team, please click the 'Confirm Subscription' link.\n\n"
    message += "We look forward to having you on board!\n\n"
    message += "Best regards,\n"
    message += f"Team {team_name}"

    return message