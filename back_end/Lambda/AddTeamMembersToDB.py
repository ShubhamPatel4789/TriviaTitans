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
    
    # Check if the 'CurrentMembers' key is already present in the item
    item = response.get('Item', {})
    current_members = item.get('CurrentMembers', {'L': []})
    
    # Check if the email is already present in the list
    if 'L' in current_members:
        emails_list = [item['S'] for item in current_members['L']]
        if email not in emails_list:
            # Email is not present, append it to the list
            current_members['L'].append({'S': email})
    
    else:
        # 'CurrentMembers' key is not present, create a new one with the email as the first element of the list
        current_members = {'L': [{'S': email}]}
    
    # Update the DynamoDB item with the new 'CurrentMembers' key
    dynamodb.update_item(
        TableName='Teams',
        Key={'teamName': {'S': team_name}},
        UpdateExpression='SET #current_members = :current_members',
        ExpressionAttributeNames={'#current_members': 'CurrentMembers'},
        ExpressionAttributeValues={':current_members': current_members}
    )

    return {
        'statusCode': 200,
        'body': 'User added to the "Current Members" attribute.'
    }
