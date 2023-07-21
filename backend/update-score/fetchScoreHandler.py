import json
import boto3
import sys
sys.path.insert(0, 'src/vendor')
import websocket

dynamodb = boto3.resource('dynamodb')
individual_score_table = dynamodb.Table('individual-score')
team_score_table = dynamodb.Table('team-score')

def send_to_websocket(json_data,game_id):
    endpoint_url = 'wss://5a0bu9svjd.execute-api.us-east-2.amazonaws.com/production?gameId='+game_id
    try:
        ws = websocket.create_connection(endpoint_url)
        ws.send(json.dumps(json_data))
        ws.close()
    except websocket.WebSocketException as e:
        print(f"Error connecting to WebSocket: {e}")

def query_table(table, key_expression, expression_values):
    response = table.scan(
        FilterExpression=key_expression,
        ExpressionAttributeValues=expression_values
    )
    return response.get('Items', [])

def lambda_handler(event, context):
    print(event)
    body = json.loads(event['body'])
    game_id = body.get('gameId')

    # Fetch individual scores for the game ID
    individual_key_expression = 'gameId = :game_id'
    individual_expression_values = {':game_id': game_id}
    response_individual = query_table(individual_score_table, individual_key_expression, individual_expression_values)

    # Fetch team scores for the game ID
    team_key_expression = 'gameId = :game_id'
    team_expression_values = {':game_id': game_id}
    response_team = query_table(team_score_table, team_key_expression, team_expression_values)

    # Prepare the response JSON
    response_data = {
        "score": {
            "teamScore": {},
            "individualScore": {}
        }
    }

    # Map team scores to the response
    for item in response_team:
        team_name = item['teamName']
        current_score = int(item['currentScore'])
        response_data["score"]["teamScore"][team_name] = current_score

    # Map individual scores to the response
    for item in response_individual:
        email = item['email']
        current_score = int(item['currentScore'])
        response_data["score"]["individualScore"][email] = current_score

    # Send the response_data JSON to WebSocket
    websocket_payload = {
        "action": "updateScore",
        "score": response_data["score"]
    }
    print(websocket_payload)
    
        # Prepare the CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Content-Type': 'application/json'
    }


    send_to_websocket(websocket_payload,game_id)

    return {
        'statusCode': 200,
        'body': json.dumps(response_data),
        'headers':cors_headers
    }
