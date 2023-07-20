from flask import Flask, jsonify, request, Blueprint
import boto3
from botocore.exceptions import NoCredentialsError

app = Flask(__name__)

invite_users_app_v2 = Blueprint('invite_users_app_v2', __name__)

@invite_users_app_v2.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = "Teams"
# Create SNS client
sns = boto3.client('sns')

topic_arn = "arn:aws:sns:us-east-1:000966082997:TeamInvitationV3"
@invite_users_app_v2.route("/invite-users/<teamName>",methods=["POST"])
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

def check_subscriiption_status_to_send_invite():
    response = dynamodb.scan(
        TableName=table_name,
        ProjectionExpression='teamName, ConfirmedSubscription'
    )
    
    for item in response['Items']:
        team_name = item['teamName']['S']
        confirmed_subscription = item.get('ConfirmedSubscription', {}).get('M', {})
        
        for email, status in confirmed_subscription.items():
            if status.get('BOOL', True):
                send_invitation_email(team_name, email)

def send_invitation_email(team_name, email):
    # Your code here to send invitation emails to individual users
    # For example, you can use the 'smtplib' library to send emails
    
    print(f"Sending invitation to {email} for team {team_name}")

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

    # update_confirmation_in_table(teamName, confirmed_emails_sns)
    # Update DynamoDB table with confirmed subscriptions
    # update_confirmed_subscriptions(confirmed_emails)

    # Check if all emails in confirmed_emails have their subscription confirmed
    # all_confirmed = all(get_subscription_status(email) for email in confirmed_emails)

    # return all_confirmed
    # if(response==True):
    #     return True
    # else:
    #     return False

def update_confirmation_in_table(teamName, email):
    response = dynamodb.get_item(
        TableName=table_name,
        Key={'teamName': {'S': teamName}}
    )
    
    item = response['Item']
    confirmed_subscription = item.get('ConfirmedSubscription', {'M': {}})
    confirmed_subscription['M'][email.replace('@', '_')] = {'BOOL': True}
    
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



def send_invitations(teamName):
    try:
        email_list = request.json['emailList']
        print(email_list)

        # Parse the JSON and extract email addresses
        emails = [email for email in email_list]
        # for email in emails:
        subscribe_user(teamName, emails)
        while True:
            if(check_subscription_status(teamName) == True):
                break
        message = generate_invitation_message("",teamName)
        subject = 'Invitation to Join Team: '+teamName
        # email_invite(emails,message,subject)
        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400

