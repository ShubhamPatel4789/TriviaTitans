""" 
vikramvenkat2408@gmail.com
vikramvenkatapathi@gmail.com
"""

from flask import Flask, jsonify, request, Blueprint
import boto3
from botocore.exceptions import NoCredentialsError
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


# Subscribe the emails to the SNS topic
def subscribe_user(team_name, emails):
    for email in emails:
        try:
            response = sns.subscribe(
                TopicArn=topic_arn,
                Protocol='email',
                Endpoint=email
            )
            create_confirmed_subscription(team_name, email)
            print(f'Subscribed {email} to the topic.')
        except Exception as e:
            print(f'Error subscribing {email}: {str(e)}')

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


def generate_invitation_message(member, sender):
    user_name = member.split('@')[0]
    message = f"Dear {user_name},\n\n"
    message += "We are excited to invite you to join our team! We believe your skills and expertise will greatly contribute to our success.\n\n"
    # message += "To accept the invitation and become a member of our team, please click the 'Confirm Subscription' link.\n\n"
    message += "We look forward to having you on board!\n\n"
    message += "Best regards,\n"
    message += f"Team {sender}"
    
    return message

def email_invite(email,invitation_message,subject):
    try:
        sns.publish(
            TopicArn=topic_arn,
            Message=invitation_message,
            Subject=subject
        )
        # print(f'Invitation sents to {email}')
        print(f'Invitations sent')
        return 200
    except NoCredentialsError:
        print('Error: Failed to send invitation. No AWS credentials found.')
        return 400
    except Exception as e:
        # print(f'Error sending invitation to {email}: {str(e)}')
        print(f'Error sending invitations')
        return 400



def check_subscription_status(teamName):
    response = sns.list_subscriptions_by_topic(
        TopicArn=topic_arn  # Replace 'your-sns-topic-arn' with your actual SNS topic ARN
    )

    confirmed_emails_sns = []

    for subscription in response['Subscriptions']:
        if subscription['SubscriptionArn'].startswith('arn:aws:sns:'):
            email = subscription['Endpoint']
            confirmed_emails_sns.append(email)
            update_confirmation_in_table(teamName, email)



def update_confirmation_in_table(teamName, email):
    response = dynamodb.get_item(
        TableName=table_name,
        Key={'teamName': {'S': teamName}}
    )
    
    item = response['Item']
    confirmed_subscription = item.get('ConfirmedSubscription', {'M': {}})

    email_key = email.replace('@', '_')
    if email_key in confirmed_subscription['M']:
        # Update the boolean value to True
        confirmed_subscription['M'][email_key]['BOOL'] = True
    else:
        # If the email is not present, add it with a True value
        confirmed_subscription['M'][email_key] = {'BOOL': True}

    dynamodb.update_item(
        TableName=table_name,
        Key={'teamName': {'S': teamName}},
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={'#attr': 'ConfirmedSubscription'},
        ExpressionAttributeValues={':val': confirmed_subscription}
    )

    # Print the updated item
    print("Updated item:", response['Attributes'])
    # return True


def get_subscription_status(email):
    response = dynamodb.get_item(
        TableName=table_name,
        Key={'teamName': {'S': 'Quiztikz'}},
        ProjectionExpression=f'ConfirmedSubscription.{email.replace("@", "_")}'
    )
    if 'Item' in response:
        confirmed_subscription = response['Item'].get('ConfirmedSubscription', {}).get(email.replace('@', '_'), {}).get('BOOL', False)
        return confirmed_subscription
    return False


def send_to_sqs(teamName, emails):
    # Create SQS client
    sqs = boto3.client('sqs')

    # Replace 'your-queue-url' with the actual URL of your SQS queue
    queue_url = 'https://sqs.us-east-1.amazonaws.com/000966082997/InvitationQueue'

    for email in emails:
        # Create the JSON message body
        message_body = {
            'teamName': teamName,
            'email': email
        }

        # Send the message to the SQS queue
        response = sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(message_body)
        )

        # Print the response if needed (optional)
        print(f"Message sent for {email}: {response['MessageId']}")

def send_invitations(teamName):
    try:
        email_list = request.json['emailList']
        print(email_list)

        # Parse the JSON and extract email addresses
        emails = [email for email in email_list]
        # for email in emails:
        subscribe_user(teamName, emails)

        # Send messages to SQS
        send_to_sqs(teamName, emails)
        # while True:
        #     if(check_subscription_status(teamName) == True):
        #         break
        # message = generate_invitation_message("",teamName)
        # subject = 'Invitation to Join Team: '+teamName
        # email_invite(emails,message,subject)
        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400

