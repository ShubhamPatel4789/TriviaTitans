import boto3
import json

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    team_name = event['team_name']
    email = event['email']

    # Fetch the DynamoDB item for the team
    response = dynamodb.get_item(
        TableName='Teams',
        Key={'teamName': {'S': team_name}}
    )

    # Check if the 'DeclinedSubscription' key is already present in the item
    item = response.get('Item', {})
    declined_subscription = item.get('DeclinedSubscription', {'L': []})

    # Extract the list of emails from the 'DeclinedSubscription' attribute
    declined_emails = [email_item['S'] for email_item in declined_subscription.get('L', [])]

    # If the email is not already in the list, add it
    if email not in declined_emails:
        print("not in list- append")
        declined_subscription['L'].append({'S': email})

        # Update the DynamoDB item with the updated 'DeclinedSubscription' list
        response = dynamodb.update_item(
            TableName='Teams',
            Key={'teamName': {'S': team_name}},
            UpdateExpression='SET DeclinedSubscription = :val',
            ExpressionAttributeValues={':val': declined_subscription}
        )

    # Remove the email from the 'CurrentMembers' attribute
    if 'CurrentMembers' in item:
        current_members = item['CurrentMembers']
        if email in current_members:
            current_members.remove(email)
            # Update the DynamoDB item with the updated 'CurrentMembers' list
            dynamodb.update_item(
                TableName='Teams',
                Key={'teamName': {'S': team_name}},
                UpdateExpression='SET CurrentMembers = :current_members',
                ExpressionAttributeValues={':current_members': current_members}
            )

    return {
        'statusCode': 200,
        'body': f'User {email} declined the invitation for Team {team_name}.'
    }
