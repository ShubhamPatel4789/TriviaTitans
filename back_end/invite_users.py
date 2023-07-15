from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
import boto3

app = Flask(__name__)

invite_users_app = Blueprint('invite_users_app', __name__)

@invite_users_app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')


@invite_users_app.route("/invite-users",methods=["POST"])
def invite_users():
    
    response = send_invitations()
    if(response == 200):
        msg = {'message': 'Invitations sent successfully'}
        return jsonify(msg), 200
    else:
        msg = {'message': 'Invalid request payload'}
        return jsonify(msg), 400


def send_invitations():
    try:
        email_list = request.json['emailList']
        print(email_list)
        # TODO: Implement the logic to send the invitations
        # You can process the emailList and send invitations to each email address
        
        # response = {'message': 'Invitations sent successfully'}
        return 200
    except KeyError:
        response = {'message': 'Invalid request payload'}
        # return jsonify(response), 400
        return 400

    
