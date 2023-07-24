import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    team_name = event['team_name']
    email = event['email']

    # Update the DynamoDB table with the new "Current Members" attribute
    response = dynamodb.update_item(
        TableName='Teams',
        Key={'teamName': {'S': team_name}},
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={'#attr': 'Current Members'},
        ExpressionAttributeValues={':val': {'M': {email.replace('@', '_'): {'BOOL': True}}}},
    )
    print(f"Added member {email} to 'Current Members' of {team_name}")

    return {
        'statusCode': 200,
        'body': 'User added to the "Current Members" attribute.'
    }
