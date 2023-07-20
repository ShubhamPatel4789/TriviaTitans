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
        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400


# when a 
# now, i want to do 
# 1. if an invite is alraedy sent, dont send 2nd time
# 2. I want send_individual_invites() to be running constantly - so that it sends
