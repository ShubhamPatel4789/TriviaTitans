""" 
vikramvenkat2408@gmail.com
vikramvenkatapathi@gmail.com
"""

from flask import Flask, jsonify, request, Blueprint
import boto3
# from botocore.exceptions import NoCredentialsError
import json
app = Flask(__name__)

invite_users_app_v3 = Blueprint('invite_users_app_v3', __name__)

@invite_users_app_v3.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = "Teams"
# Create SNS client
sns = boto3.client('sns')

topic_arn = "arn:aws:sns:us-east-1:000966082997:TeamInvitationV3"
@invite_users_app_v3.route("/invite-users/<teamName>",methods=["POST"])
def invite_users(teamName):
    
    response = send_invitations(teamName)
    if(response == 200):
        msg = {'message': 'Invitations sent successfully'}
        return jsonify(msg), 200
    else:
        msg = {'message': 'Invalid request payload'}
        return jsonify(msg), 400



def subscribe_user(team_name, emails):
    for email in emails:
        try:
            # Check if the topic with the name "<team_name>_SNS" already exists
            topic_name = f"Team_{team_name}_SNS"
            existing_topics = sns.list_topics()['Topics']
            existing_topic_arn = next((topic['TopicArn'] for topic in existing_topics if topic_name in topic['TopicArn']), None)

            if existing_topic_arn:
                # If the topic already exists, subscribe the email to the existing topic
                response = sns.subscribe(
                    TopicArn=existing_topic_arn,
                    Protocol='email',
                    Endpoint=email
                )
                print(f"Subscribed {email} to the existing topic: {existing_topic_arn}")
            else:
                # If the topic does not exist, create a new topic and subscribe the email to it
                response = sns.create_topic(Name=topic_name)
                new_topic_arn = response['TopicArn']
                response = sns.subscribe(
                    TopicArn=new_topic_arn,
                    Protocol='email',
                    Endpoint=email
                )
                print(f"Subscribed {email} to the new topic: {new_topic_arn}")

            # Update the confirmed subscription in the DynamoDB table
            create_confirmed_subscription(team_name, email)
        except Exception as e:
            print(f"Error subscribing {email}: {str(e)}")


def create_confirmed_subscription(team_name, email):
    response = dynamodb.get_item(
        TableName=table_name,
        Key={'teamName': {'S': team_name}}
    )
    
    if 'Item' not in response:
        # The item doesn't exist, so create it with the ConfirmedSubscription attribute and the first email
        item = {
            'teamName': {'S': team_name},
            'ConfirmedSubscription': {'M': {email.replace('@', '_'): {'BOOL': False}}}
        }
        
        dynamodb.put_item(TableName=table_name, Item=item)
        print("Subscription added successfully for : ", email)
        return True
    
    # The item exists, so update the ConfirmedSubscription attribute with the new email
    item = response['Item']
    confirmed_subscription = item.get('ConfirmedSubscription', {'M': {}})
    confirmed_subscription['M'][email.replace('@', '_')] = {'BOOL': False}
    
    dynamodb.update_item(
        TableName=table_name,
        Key={'teamName': {'S': team_name}},
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={'#attr': 'ConfirmedSubscription'},
        ExpressionAttributeValues={':val': confirmed_subscription}
    )
    
    print("Subscription added successfully for : ", email)
    return True


def send_to_sqs(teamName):
    # Create SQS client
    sqs = boto3.client('sqs')

    # Replace 'your-queue-url' with the actual URL of your SQS queue
    queue_url = 'https://sqs.us-east-1.amazonaws.com/000966082997/InvitationQueue'

    # Create the JSON message body
    message_body = {
        'teamName': teamName
    }

    # Send the message to the SQS queue
    response = sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(message_body)
    )

    # Print the response if needed (optional)
    print(f"Message sent for {teamName}: {response['MessageId']}")

def send_invitations(teamName):
    try:
        email_list = request.json['emailList']
        print(email_list)

        # Parse the JSON and extract email addresses
        emails = [email for email in email_list]
        # for email in emails:
        subscribe_user(teamName, emails)
        # send_verification_email(emails)

        # Send messages to SQS
        send_to_sqs(teamName)

        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400

