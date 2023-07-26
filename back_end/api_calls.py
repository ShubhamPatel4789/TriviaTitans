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

# Initialize the AWS Lambda client
lambda_client = boto3.client('lambda')

@api_calls_app.route("/get-current-members/<teamName>",methods=["POST"])
def get_team_members(teamName):
    table = dynamodb.Table(table_name)
    
    # Query the table for the given team name
    response = table.query(
        KeyConditionExpression='teamName = :team_name',
        ExpressionAttributeValues={':team_name': teamName}
    )
    
    # print(response['Items']['CurrentMembers'])
    items = response['Items']
    # print(items)
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
        'teamName': None,
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
    return team_details_response

@api_calls_app.route("/remove-member", methods=["POST"])
def remove_member():
    try:
        email = request.json['email']
        # Get the team_name from the request
        team_name = request.json.get('team_name')

        # Construct the payload for the Lambda function
        payload = {
            "team_name": team_name,
            "email": email
        }
        # print(payload)
        # Invoke the UpdateDeclinedInvitationsToDB Lambda asynchronously
        response = lambda_client.invoke(
            FunctionName='UpdateDeclinedInvitationsToDB',
            InvocationType='Event',
            Payload=json.dumps(payload)
        )
        # print(response)
        # Check if the invocation was successful
        if response['StatusCode'] == 202:
            return {"message": f"Member - {email}, removal success."}, 200
        else:
            error_response = {"error": "Failed to remove member.", "response":response} 
            return jsonify(error_response), 500
        # return "",200
    except Exception as e:
        return {"error": str(e)}, 500
    
@api_calls_app.route("/get-admin", methods=["POST"])
def get_admin():
    dynamodb_client = boto3.client('dynamodb')

    try:
        request_data = request.get_json()
        team_name = request_data.get('team_name')

        # Fetch the DynamoDB item for the team
        response = dynamodb_client.get_item(
            TableName='Teams',
            Key={'teamName': {'S': team_name}}
        )

        item = response.get('Item', {})
        admin_email = item.get('Admin', {}).get('S', '')
        print(f"Team: {team_name}, Admin: ", admin_email)
        return {
            'statusCode': 200,
            'body': json.dumps({'admin_email': admin_email})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

