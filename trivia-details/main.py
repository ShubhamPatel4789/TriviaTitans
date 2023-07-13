from flask import  jsonify, request
from google.cloud import firestore
import logging
from datetime import datetime, timedelta
import uuid

db = firestore.Client()

def get_trivia(request):
    try:
        category = request.args.get('filter[category]', None)
        difficulty = request.args.get('filter[difficulty]', None)
        timeframe = request.args.get('filter[timeframe]', None)
        trivia_collection = db.collection('trivia')
        query = trivia_collection
        # If filter parameter is not provided, return all trivia
        if not category and not difficulty and not timeframe:
            query = query.stream()
        else:
            if category:
               query= query.where('categoryName', '==', category)
            if difficulty:
                query= query.where('difficultyLevel', '==', difficulty)
            if timeframe:
                query= query.where('timeFrame', '==', int(timeframe))
            

            trivia_collection = db.collection('trivia')
            query = query.stream()

        results = []
        for doc in query:
            trivia_data = doc.to_dict()
            result_data = {
                'triviaId': trivia_data.get('triviaId', ''),
                'triviaName': trivia_data.get('triviaName', ''),
                'categoryName': trivia_data.get('categoryName', ''),
                'difficultyLevel': trivia_data.get('difficultyLevel', ''),
                'timeFrame': trivia_data.get('timeFrame', 0),
                'shortDescription': trivia_data.get('shortDescription', '')
            }
            results.append(result_data)

        return jsonify(results), 200
    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        print(str(e))
        return jsonify({'error': 'Service Unavailable'}), 503


def join_game(request):
    try:
        email_id = request.json.get('emailId')
        trivia_id = request.json.get('triviaId')

        if not email_id or not trivia_id:
            # Return a 400 Bad Request error if emailId or triviaId is missing
            return jsonify({'error': 'Both emailId and triviaId parameters are required.'}), 400

        # Check if the 'active-games' collection exists, and create it if not present


        active_games_collection = db.collection('active-games')

        # Generate a new game ID
        game_id = str(uuid.uuid4())

        # Calculate the start timestamp (10 minutes from the current time)
        start_timestamp = datetime.now() + timedelta(minutes=10)

        # Check if the game already exists
        existing_games = active_games_collection.where('triviaId', '==', trivia_id).limit(1).stream()
        if existing_games:
            for game_doc in existing_games:
                game_data = game_doc.to_dict()
                participant_emails = game_data.get('participantEmails', [])
                if email_id in participant_emails:
                    return jsonify({'message': 'Email already registered.', 'gameId': game_doc.id}), 200
               
                participant_emails.append(email_id)
                game_data['participantEmails'] = participant_emails
                active_games_collection.document(game_doc.id).update(game_data)

                # Log the join game activity
                logging.info(f"Added participant {email_id} to existing game {game_doc.id}")

                return jsonify({'message': 'Successfully joined the game.', 'gameId': game_doc.id}), 200

        # Search for the trivia in the 'categoryTrivia' collection
        category_trivia_collection = db.collection('trivia')

        query = category_trivia_collection.where('triviaId', '==', trivia_id).limit(1).stream()
        if query:
            for trivia_doc in query:
                trivia_data = trivia_doc.to_dict()
                category_name = trivia_data.get('categoryName')

                # Create a new game document in the active-games collection
                game_data = {
                    'gameId': game_id,
                    'triviaId': trivia_id,
                    'timeFrames':trivia_data.get('timeFrames') ,  # Set the appropriate value for time frames
                    'startTimestamp': format_timestamp(start_timestamp),
                    'isStarted': False,
                    'participantEmails': [email_id],

                }

                active_games_collection.document(game_id).set(game_data)

                # Log the join game activity
                logging.info(f"Created new game {game_id} with participant {email_id}")

                return jsonify({'message': 'Successfully joined the game.', 'gameId': game_id}), 200
        else:
            # Return a 404 Not Found error if the trivia with the provided triviaId is not found
            return jsonify({'error': 'Trivia not found.'}), 404

    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        return jsonify({'error': 'Service Unavailable'}), 503

def active_games(request):
    try:
        games=[]
        query = db.collection('active-games').stream()
        if query:
            for game_doc in query:
                game_data = game_doc.to_dict()
                trivia_id = game_data.get('triviaId')
                trivia_query = db.collection('trivia').where('triviaId', '==', trivia_id).limit(1).stream()
                trivia_info=None
                if trivia_query:
                    for trivia_doc in trivia_query:
                        trivia_data = trivia_doc.to_dict()
                        trivia_info = {
                        'triviaId': trivia_data.get('triviaId', ''),
                        'triviaName': trivia_data.get('triviaName', ''),
                        'categoryName': trivia_data.get('categoryName', ''),
                        'difficultyLevel': trivia_data.get('difficultyLevel', ''),
                        'timeFrame': trivia_data.get('timeFrame', 0),
                        'shortDescription': trivia_data.get('shortDescription', '')
                        }
                is_game_started,time_remaining,is_game_ended=get_remaining_time(parse_timestamp(game_data['startTimestamp']),trivia_data.get('timeFrame', 0))
                game_resp = {
                    'gameId': game_data.get('gameId'),
                    'trivia': trivia_info,
                    'timeRemaining':time_remaining,
                    'isGameStarted': is_game_started,
                    'isGameEnded':is_game_ended,
                    'participantEmails': game_data.get('participantEmails'),

                }
                games.append(game_resp)
        return jsonify({'games': games}), 200
    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        return jsonify({'error': 'Service Unavailable'}), 503


def format_timestamp(timestamp):
    # Format the timestamp to the desired format
    formatted_timestamp = timestamp.strftime("%B %d, %Y at %I:%M:%S %p %Z%z")
    return formatted_timestamp

def parse_timestamp(formatted_timestamp):
    # Parse the formatted timestamp string to a datetime object
    timestamp = datetime.strptime(formatted_timestamp, "%B %d, %Y at %I:%M:%S %p ")
    return timestamp

def get_remaining_time(startTimestamp,timeFrame):
    current_time=datetime.now()
    is_game_started = False
    time_remaining=0
    time_remaining_string=""
    is_game_ended=False
    if startTimestamp < current_time:
        is_game_started = True
        end_timestamp = startTimestamp + timedelta(minutes=timeFrame)
        time_remaining = (end_timestamp - current_time).total_seconds()
        # Calculate minutes and seconds
        minutes = int(time_remaining // 60)
        if minutes<0:
            is_game_ended=True
        seconds = int(time_remaining % 60)
        #Format the time remaining as a string
        time_remaining_string = f"{minutes:02d}:{seconds:02d}"
    return is_game_started,time_remaining_string,is_game_ended
