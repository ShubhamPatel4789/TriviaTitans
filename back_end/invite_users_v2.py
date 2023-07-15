from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
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
topic_arn = 'arn:aws:sns:us-east-1:901937685861:TeamInvitation'

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
    message = f"Dear Member,\n\n"
    message += "We are excited to invite you to join our team! We believe your skills and expertise will greatly contribute to our success.\n\n"
    # message += "To accept the invitation and become a member of our team, please click the 'Confirm Subscription' link.\n\n"
    message += "We look forward to having you on board!\n\n"
    message += "Best regards,\n"
    message += f"{sender}"
    
    return message

def email_invite(email,invitation_message,subject):
    try:
        sns.publish(
            TopicArn=topic_arn,
            Message=invitation_message,
            Subject=subject
        )
        print(f'Invitation sent to {email}')
    except NoCredentialsError:
        print('Error: Failed to send invitation. No AWS credentials found.')
    except Exception as e:
        print(f'Error sending invitation to {email}: {str(e)}')

        return 200

def send_invitations(teamName):
    try:
        email_list = request.json['emailList']
        print(email_list)

        # Parse the JSON and extract email addresses
        emails = [email for email in email_list]
        # for email in emails:
        subscribe_user(emails)
        message = generate_invitation_message("","<add_sender>")
        subject = 'Invitation to Join Team: '+teamName
        email_invite(emails,message,subject)
        return 200
    
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400

    
