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