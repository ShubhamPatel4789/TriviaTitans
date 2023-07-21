import json
import boto3

dynamodb = boto3.resource('dynamodb')
individual_score_table = dynamodb.Table('individual-score')
team_score_table = dynamodb.Table('team-score')



def update_score(event, context):
    body = json.loads(event['body'])
    email = body.get('email')
    team_name = body.get('teamName')
    game_id = body.get('gameId')
    correct_answer = body.get('correctAnswer')
    answered = body.get('answered')
    current_question = body.get('currentQuestion')

    # Lambda function name to invoke
    function_name = "update-score-dev-fetchScore"

    # AWS Lambda client
    lambda_client = boto3.client('lambda')

    emailDocumentPresent=False
    teamDocumentPresent=False

    if email:
    # Check if individual score exists, if not, insert a new document
        response = individual_score_table.get_item(Key={'email': email, 'gameId': game_id})
        if 'Item' in response:
            emailDocumentPresent=True 
    
    if team_name:
    # Check if team score exists, if not, insert a new document
        response = team_score_table.get_item(Key={'teamName': team_name, 'gameId': game_id})
        if 'Item' in response:
            teamDocumentPresent=True 

    if not answered:
        if email:
            if emailDocumentPresent:
                # Update individual score with timedOutAnswers and currentQuestion
                individual_score_table.update_item(
                    Key={'email': email, 'gameId': game_id},
                    UpdateExpression='SET timedOutAnswers = if_not_exists(timedOutAnswers, :zero) + :val, currentQuestion = :cq',
                    ExpressionAttributeValues={':val': 1, ':zero': 0, ':cq': current_question},
                    ReturnValues='UPDATED_NEW'
                )
            else:
                # Insert a new document for individual score
                individual_score_table.put_item(
                    Item={
                        'email': email,
                        'gameId': game_id,
                        'currentScore': 0,
                        'timedOutAnswers': 1,
                        'correctAnswer': 0,
                        'incorrectAnswer': 0,
                        'currentQuestion': current_question
                    }
                )
        elif team_name:

            if teamDocumentPresent:
                # Update team score with timedOutAnswers and currentQuestion
                team_score_table.update_item(
                    Key={'teamName': team_name, 'gameId': game_id},
                    UpdateExpression='SET timedOutAnswers = if_not_exists(timedOutAnswers, :zero) + :val, currentQuestion = :cq',
                    ExpressionAttributeValues={':val': 1, ':zero': 0, ':cq': current_question},
                    ReturnValues='UPDATED_NEW'
                )
            else:
                # Insert a new document for team score
                team_score_table.put_item(
                    Item={
                        'teamName': team_name,
                        'gameId': game_id,
                        'currentScore': 0,
                        'timedOutAnswers': 1,
                        'correctAnswer': 0,
                        'incorrectAnswer': 0,
                        'currentQuestion': current_question
                    }
                )
    if email and correct_answer:
        if emailDocumentPresent:
            individual_score_table.update_item(
                Key={'email': email, 'gameId': game_id},
                UpdateExpression='SET currentScore = currentScore + :val, correctAnswer = correctAnswer + :counter, currentQuestion = :cq',
                ExpressionAttributeValues={':val': 10, ':counter': 1,':cq': current_question},
                ReturnValues='UPDATED_NEW'
            )
        else:
             # Insert a new document for individual score
            individual_score_table.put_item(
                    Item={
                        'email': email,
                        'gameId': game_id,
                        'currentScore': 10,
                        'timedOutAnswers': 0,
                        'correctAnswer': 1,
                        'incorrectAnswer': 0,
                        'currentQuestion': current_question
                    }
                )
    if team_name and correct_answer:
        if teamDocumentPresent:
            team_score_table.update_item(
                Key={'teamName': team_name, 'gameId': game_id},
                UpdateExpression='SET currentScore = currentScore + :val, correctAnswer = correctAnswer + :counter, currentQuestion = :cq',
                ExpressionAttributeValues={':val': 10, ':counter': 1,':cq': current_question},
                ReturnValues='UPDATED_NEW'
            )
        else:
             # Insert a new document for individual score
            team_score_table.put_item(
                    Item={
                        'teamName': team_name,
                        'gameId': game_id,
                        'currentScore': 10,
                        'timedOutAnswers': 0,
                        'correctAnswer': 1,
                        'incorrectAnswer': 0,
                        'currentQuestion': current_question
                    }
                )
    data = {
    'gameId':game_id
    }
    # Convert the data dictionary to a JSON string
    json_data = json.dumps(data)
    resp={'body':json_data}
    json_resp=json.dumps(resp)
    try:
        # Invoke the update_score Lambda function asynchronously
        lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='Event',  # Asynchronous invocation
            Payload=json_resp
        )
    except Exception as e:
        print(e)
           # Prepare the CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Content-Type': 'application/json'
    }
    return {
        'statusCode': 200,
        'body': json.dumps('Score updated successfully'),
        'headers':cors_headers

    }
