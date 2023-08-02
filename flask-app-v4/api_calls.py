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

@api_calls_app.route("/get-current-members/<teamName>", methods=["POST"])
def get_team_members(teamName):
    table = dynamodb.Table(table_name)
    
    # Query the table for the given team name
    response = table.query(
        KeyConditionExpression='teamName = :team_name',
        ExpressionAttributeValues={':team_name': teamName}
    )
    
    items = response['Items']
    if items:
        team_members = items[0].get('CurrentMembers', [])  # Use an empty list as the default if 'CurrentMembers' not found
        print(f"Return Team members of {teamName}:", team_members)
        return jsonify(team_members)  # Convert the list to a JSON response
    return jsonify([])  # Return an empty JSON response if no team members found

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
    


@api_calls_app.route("/promote-to-admin", methods=["POST"])
def promote_to_admin():
    dynamodb_client = boto3.client('dynamodb')
    try:
        data = json.loads(request.data)
        email = data.get('promote_to_admin')
        team_name = data.get('team_name')

        # Fetch the DynamoDB item for the team
        response = dynamodb_client.get_item(
            TableName='Teams',
            Key={'teamName': {'S': team_name}}
        )

        # Check if the team exists and the 'Admin' key is present
        item = response.get('Item', {})
        admin_email = item.get('Admin', {}).get('S', '')

        if not admin_email:
            return {
                'statusCode': 400,
                'body': f'Admin email not found for Team {team_name}.'
            }

        # Update the DynamoDB item to promote the specified email to admin
        response = dynamodb_client.update_item(
            TableName='Teams',
            Key={'teamName': {'S': team_name}},
            UpdateExpression='SET Admin = :email',
            ExpressionAttributeValues={':email': {'S': email}}
        )

        return {
            'statusCode': 200,
            'body': f'Successfully promoted {email} to admin for Team {team_name}.'
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
    
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
        return {"admin_email": admin_email}, 200
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
# def call_get_admin(team_name):
#     api_url = "http://localhost:5000/get-admin"
#     headers = {
#         "Content-Type": "application/json"
#     }

#     # Prepare the request data as JSON
#     data = {
#         "team_name": team_name
#     }

#     # Make the HTTP POST request to the /get-admin route
#     response = requests.post(api_url, headers=headers, json=data)

#     if response.status_code == 200:
#         admin_data = response.json()
#         admin_email = admin_data.get("admin_email")
#         print(f"Admin Email for team {team_name}: {admin_email}")
#         return admin_email, 200
#     else:
#         print(f"Failed to get admin for team {team_name}. Status Code: {response.status_code}")


@api_calls_app.route("/leave-team", methods=["POST"])
def leave_team():
    try:
        request_data = request.get_json()
        email = request_data.get('email')
        team_name = request_data.get('team_name')

        # First, check if the email is the admin by calling the get_admin() function
        # admin_email = call_get_admin(team_name)
        admin_data = get_admin()
        admin_email = admin_data[0]['admin_email']
        # print(admin_email)
        if email == admin_email:
            return jsonify({'message': 'Cannot leave team. You are the admin.'}), 400

        # If the email is not the admin, then call remove_member() function
        # Define the remove_member() function here or import it if it's defined elsewhere
        remove_member()

        return jsonify({'message': 'Successfully left the team.'}), 200

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
# @api_calls_app.route("/leave-team", methods=["POST"])
# def leave_team():
#     data = request.get_json()

#     if not data or "email" not in data:
#         return jsonify({"message": "Invalid request. Email not provided."}), 400

#     email = data["email"]

#     # Check if the email is the admin
#     admin_response = get_admin()
#     if admin_response.status_code == 200:
#         admin_data = admin_response.json()
#         if admin_data["admin_email"] == email:
#             return jsonify({"message": "You are the admin and cannot leave the team."}), 400

#     # Remove the member from the team
#     remove_member_response = remove_member(email)
#     if remove_member_response.status_code == 200:
#         return jsonify({"message": f"Successfully left the team."}), 200
#     elif remove_member_response.status_code == 400:
#         return jsonify({"message": "User not found in CurrentMembers for the team."}), 400
#     else:
#         return jsonify({"message": "Failed to leave the team."}), 500

