from flask import Flask, jsonify, request, Blueprint
import boto3
from botocore.exceptions import NoCredentialsError
import json
app = Flask(__name__)

api_calls_app = Blueprint('api_calls_app', __name__)

@api_calls_app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Create DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table_name = "Teams"


@api_calls_app.route("/get-team-members/<teamName>",methods=["POST"])
def get_team_members(teamName):
    table = dynamodb.Table(table_name)
    
    # Query the table for the given team name
    response = table.query(
        KeyConditionExpression='teamName = :team_name',
        ExpressionAttributeValues={':team_name': teamName}
    )
    
    # print(response['Items']['CurrentMembers'])
    items = response['Items']
    print(items)
    # currentMembers = items['CurrentMembers']
    if items:
        team_members = items[0].get('CurrentMembers', [])  # Use an empty list as the default if 'CurrentMembers' not found
        print(f"Return Team members of {teamName}:",team_members)
        return team_members
    return []

@api_calls_app.route("/get-team-details",methods=["POST"])
def fetch_team_details():
    team_details_response = {
        'isPartOfTeam': False,
        'teamName': "",
        'isTeamAdmin': False,
        'teamMembers': []
    }
    # Extract the email from the JSON request
    email = request.json['email']
    # print(email)
    # dynamodb_client = boto3.client('dynamodb')
    table = dynamodb.Table(table_name)

    response = table.scan()
    items = response.get('Items', [])
    # print(items)
    
    for item in items:
        team_name = item.get('teamName')
        print(team_name)
        current_members = item.get('CurrentMembers', [])
        print(current_members)
        print("current_members:",current_members)
        isAdmin = item['Admin'] == email
        print(isAdmin)
        if email in current_members:
            print(True)
            team_details_response['isPartOfTeam'] = True
            team_details_response['teamName'] = team_name
            team_details_response['teamMembers'] = current_members.copy()
            team_details_response['isTeamAdmin'] = isAdmin
            return team_details_response
            # break
    return []
