import json
import boto3
import sys

sys.path.insert(0, 'src/vendor')
import requests
import websocket

dynamodb = boto3.resource('dynamodb')
individual_score_table = dynamodb.Table('individual-score')
team_score_table = dynamodb.Table('team-score')

def call_game_over(game_id):
    url = 'https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-updateGameStatus'
    payload = {
        "gameEnded": True,
        "gameId": game_id
    }
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an error for HTTP error status codes
        print("HTTP call succeeded:", response.text)
    except requests.exceptions.RequestException as e:
        print("Error making the HTTP call:", e)

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

def calculatePodiumPlaces(all_scores):
    sorted_all_scores = dict(sorted(all_scores.items(), key=lambda x:x[1], reverse=True))
    podiumPlaces=[]

    for key, value in sorted_all_scores.items():
        podiumPlaces.append({'participant':key,'score':value})
    return podiumPlaces

def add_podium_places_to_db(podium_places,game_id):
    first=""
    second=""
    third=""

    for index, value in enumerate(podium_places):
        if index==0:
            first=value['participant']
        if index==1:
            second=value['participant']
        if index==2:
            third=value['participant']

    # Save the podiumPlaces data to DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('podium-places')
    table.put_item(
        Item={
            'gameId': game_id,
            'first': first,
            'second': second,
            'third': third
        }
    )


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
    allScores={}

    # Prepare the response JSON
    response_data = {
        "score": {
            "teamScore": {},
            "individualScore": {},
            
        },
        "isGameOver":False,
        "podiumPlaces":[]
    }
    is_game_over=True
    # Map team scores to the response
    for item in response_team:
        team_name = item['teamName']
        current_score = int(item['currentScore'])
        response_data["score"]["teamScore"][team_name] = current_score
        allScores[team_name]=current_score
        if  not item['isGameOver']:
            is_game_over=False

    # Map individual scores to the response
    for item in response_individual:
        email = item['email']
        current_score = int(item['currentScore'])
        response_data["score"]["individualScore"][email] = current_score
        allScores[email]=current_score
        if  not item['isGameOver']:
            is_game_over=False

    podium_places=[]
    if is_game_over:
        podium_places=calculatePodiumPlaces(allScores)
        add_podium_places_to_db(podium_places,game_id)
        response_data['podiumPlaces']=podium_places

    response_data['isGameOver']=is_game_over
    # Send the response_data JSON to WebSocket
    websocket_payload = {
        "action": "updateScore",
        "data": response_data
        
    }
    print(websocket_payload)
    
        # Prepare the CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Content-Type': 'application/json'
    }
    call_game_over(game_id)
    send_to_websocket(websocket_payload,game_id)

    return {
        'statusCode': 200,
        'body': json.dumps(response_data),
        'headers':cors_headers
    }
