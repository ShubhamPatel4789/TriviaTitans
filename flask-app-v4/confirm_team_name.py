from flask import Flask, jsonify, request, Blueprint
# from flask_cors import CORS
import boto3

app = Flask(__name__)

confirm_team_name_app = Blueprint('confirm_team_name_app', __name__)

@confirm_team_name_app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')


@confirm_team_name_app.route("/confirm-team-name",methods=["POST"])
def confirm_team_name():
    team_name = request.json['teamName']
    # Add the team name record to DynamoDB table 'Teams'
    response = dynamodb.put_item(
        TableName='Teams',
        Item={
            'teamName': {'S': team_name}
        }
    )
    return jsonify({'message': 'Record added successfully'}), 200

    
