from flask import Flask, jsonify, request, Blueprint
# from flask_cors import CORS
import boto3
from botocore.exceptions import NoCredentialsError

app = Flask(__name__)

invite_users_app = Blueprint('invite_users_app', __name__)

@invite_users_app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')

# Create SNS client
sns = boto3.client('sns')
# topic_arn = 'arn:aws:sns:us-east-1:000966082997:TeamInvitation'
# topic_arn = "arn:aws:sns:us-east-1:000966082997:TeamInvitation_v2.fifo"
topic_arn = "arn:aws:sns:us-east-1:000966082997:TeamInvitationV3"
@invite_users_app.route("/invite-users/<teamName>",methods=["POST"])
def invite_users(teamName):
    
    response = send_invitations(teamName)
    if(response == 200):
        msg = {'message': 'Invitations sent successfully'}
        return jsonify(msg), 200
    else:
        msg = {'message': 'Invalid request payload'}
        return jsonify(msg), 400

# response = sns.subscribe(
#             TopicArn=topic_arn,
#             Protocol='email',
#             Endpoint=email,
#             Message=invitation_message,
#             Subject=subject
#         )
# Subscribe the emails to the SNS topic
def subscribe_user(emails):
    for email in emails:
        try:
            response = sns.subscribe(
                TopicArn=topic_arn,
                Protocol='email',
                Endpoint=email
            )
            print(f'Subscribed {email} to the topic.')
        except Exception as e:
            print(f'Error subscribing {email}: {str(e)}')

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

def get_team_members(team_name):
    # Create DynamoDB client

    # Replace 'YourTableName' with the name of your DynamoDB table
    table_name = 'Teams'

    table = dynamodb.Table(table_name)

    try:
        # Query DynamoDB table to get all members of the specified team
        response = table.get_item(
            Key={
                'teamName': team_name
            }
        )
        
        # Get the list of team members' email addresses from the response
        team_members = response.get('Item', {}).get('team_members', [])
        return team_members
        
    except Exception as e:
        print(f'Error retrieving team members: {str(e)}')
        return []

def send_individual_invites(team_name):
    # Retrieve team members from DynamoDB
    team_members = get_team_members(team_name)

    # Iterate over team members' email addresses
    for email in team_members:
        try:
            # Check if the subscription is confirmed for each email
            response = sns.get_subscription_attributes(
                SubscriptionArn=f'{topic_arn}:{email}'
            )
            if response['Attributes']['ConfirmationWasAuthenticated'] == 'true':
                # Generate invitation message
                invitation_message = generate_invitation_message(email, team_name)
                subject = 'Invitation to Join Team: ' + team_name
                print(email)
                # Send individual email invite to the confirmed subscriber
                # email_invite(email, invitation_message, subject)
        
        except Exception as e:
            print(f'Error checking subscription status or sending invitation to {email}: {str(e)}')

def send_invitations(teamName):
    try:
        email_list = request.json['emailList']
        print(email_list)

        # Parse the JSON and extract email addresses
        emails = [email for email in email_list]
        # for email in emails:
        subscribe_user(emails)
        message = generate_invitation_message("",teamName)
        subject = 'Invitation to Join Team: '+teamName
        # email_invite(emails,message,subject)
        send_individual_invites(teamName)
        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400
