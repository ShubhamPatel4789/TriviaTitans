import boto3
import json

def lambda_handler(event, context):
    # Create SNS and DynamoDB clients
    sns = boto3.client('sns')
    dynamodb = boto3.client('dynamodb')

    # Fetch all SNS topics
    topics = sns.list_topics()['Topics']

    for topic in topics:
        topic_arn = topic['TopicArn']
        topic_name = topic_arn.split(':')[-1]  # Extract the topic name from ARN

        # Check if the topic name matches the specified format
        if topic_name.startswith('Team_') and topic_name.endswith('_SNS'):
            team_name = topic_name[len('Team_'):-len('_SNS')]

            # Fetch all subscribers for the topic
            response = sns.list_subscriptions_by_topic(TopicArn=topic_arn)

            for subscription in response['Subscriptions']:
                email = subscription['Endpoint']
                confirmed = subscription['SubscriptionArn'] != 'PendingConfirmation' and subscription['Protocol'] == 'email'

                # Fetch the DynamoDB item for the team
                response = dynamodb.get_item(
                    TableName='Teams',
                    Key={'teamName': {'S': team_name}}
                )

                # print(response)
                # Update the DynamoDB item with the confirmation status
                item = {
                    'teamName': {'S': team_name},
                    'ConfirmedSubscription': {'M': {}}
                }

                if 'Item' in response:
                    item = response['Item']

                confirmed_subscription = item.get('ConfirmedSubscription', {'M': {}})
                confirmed_subscription['M'][email.replace('@', '_')] = {'BOOL': confirmed}
                print("<<<",confirmed_subscription)

                dynamodb.update_item(
                    TableName='Teams',
                    Key={'teamName': {'S': team_name}},
                    UpdateExpression='SET #attr = :val',
                    ExpressionAttributeNames={'#attr': 'ConfirmedSubscription'},
                    ExpressionAttributeValues={':val': confirmed_subscription}
                )
                invoke_add_team_members_lambda(team_name, email)

    return {
        'statusCode': 200,
        'body': 'DynamoDB table updated successfully.'
    }

def invoke_add_team_members_lambda(team_name, email):
    lambda_client = boto3.client('lambda')
    payload = {
        'team_name': team_name,
        'email': email
    }
    response = lambda_client.invoke(
        FunctionName='AddTeamMembersToDB',
        InvocationType='Event',
        Payload=json.dumps(payload)
    )
    print(f"Invoked AddTeamMembersToDB lambda for {email}. Response: {response}")