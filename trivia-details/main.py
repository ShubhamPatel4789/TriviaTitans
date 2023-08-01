from flask import  jsonify, request
from google.cloud import firestore
import logging
from datetime import datetime, timedelta
import uuid




# Initialize the Firestore client
db = firestore.Client()

# Define the CORS headers function
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # Allow requests from any domain
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'  # Allow the specified HTTP methods
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'  # Allow the specified request header
    return response

def get_document_by_id(collection_name, document_id):
    
    collection_ref = db.collection(collection_name)
    doc_ref = collection_ref.document(document_id)
    doc = doc_ref.get()
    
    if doc.exists:
        return doc.to_dict()
    else:
        return None



def get_trivia(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))

    try:
        category = request.args.get('filter[category]', None)
        difficulty = request.args.get('filter[difficulty]', None)
        timeframe = request.args.get('filter[timeframe]', None)
        trivia_collection = db.collection('Trivia')
        query = trivia_collection
        # If filter parameter is not provided, return all trivia
        if not category and not difficulty and not timeframe:
            query = query.stream()
        else:
            if category:
               query= query.where('category', '==', category)
            if difficulty:
                query= query.where('difficultyLevel', '==', difficulty)
            if timeframe:
                query= query.where('timeframe', '==', int(timeframe))
            
            trivia_collection = db.collection('Trivia')
            query = query.stream()

        results = []
        for doc in query:
            trivia_data = doc.to_dict()
            result_data = {
                'triviaId': doc.id,
                'triviaName': trivia_data.get('triviaName', ''),
                'categoryName': trivia_data.get('category', ''),
                'difficultyLevel': trivia_data.get('difficultyLevel', ''),
                'timeFrame': trivia_data.get('timeframe', 0),
                'shortDescription': trivia_data.get('shortDescription', '')
            }
            results.append(result_data)

        response = jsonify(results)
        return add_cors_headers(response), 200
    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        print(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503


def join_game(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))
    try:
        email_id = request.json.get('emailId')
        trivia_id = request.json.get('triviaId')

        if not email_id or not trivia_id:
            # Return a 400 Bad Request error if emailId or triviaId is missing
            response = jsonify({'error': 'Both emailId and triviaId parameters are required.'})
            return add_cors_headers(response), 400

        # Check if the 'active-games' collection exists, and create it if not present

        active_games_collection = db.collection('active-games')

        # Generate a new game ID
        game_id = str(uuid.uuid4())

        # Calculate the start timestamp (10 minutes from the current time)
        start_timestamp = datetime.now() + timedelta(minutes=10)

        # Check if the game already exists
        existing_games = active_games_collection.where('triviaId', '==', trivia_id).where('gameEnded', '==', False).limit(1).stream()
        if existing_games:
            for game_doc in existing_games:
                game_data = game_doc.to_dict()
                participant_emails = game_data.get('participantEmails', [])
                if email_id in participant_emails:
                    response = jsonify({'message': 'Email already registered.', 'gameId': game_doc.id})
                    return add_cors_headers(response), 200
                
                participant_emails.append(email_id)
                game_data['participantEmails'] = participant_emails
                active_games_collection.document(game_doc.id).update(game_data)

                # Log the join game activity
                logging.info(f"Added participant {email_id} to existing game {game_doc.id}")

                response = jsonify({'message': 'Successfully joined the game.', 'gameId': game_doc.id})
                return add_cors_headers(response), 200
        
        trivia_data = get_document_by_id('Trivia',trivia_id)
        if trivia_data:
            game_data = {
                'gameId': game_id,
                'triviaId': trivia_id,
                'timeFrames':trivia_data.get('timeframe') ,  # Set the appropriate value for time frames
                'startTimestamp': format_timestamp(start_timestamp),
                'isStarted': False,
                'participantEmails': [email_id],
                'participantTeams': [],
                'gameEnded':False,
                'category':trivia_data.get('category')
            }

            active_games_collection.document(game_id).set(game_data)

            # Log the join game activity
            logging.info(f"Created new game {game_id} with participant {email_id}")

            response = jsonify({'message': 'Successfully joined the game.', 'gameId': game_id})
            return add_cors_headers(response), 200
        else:
            # Return a 404 Not Found error if the trivia with the provided triviaId is not found
            response = jsonify({'error': 'Trivia not found.'})
            return add_cors_headers(response), 404

    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503



def update_game_status(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))
    try:
        game_id = request.json.get('gameId')
        game_ended=request.json.get('gameEnded')

        if not game_id or not game_ended:
            # Return a 400 Bad Request error if emailId or triviaId is missing
            response = jsonify({'error': 'Both game_id and game_ended parameters are required.'})
            return add_cors_headers(response), 400

        # Check if the 'active-games' collection exists, and create it if not present
        active_games_collection = db.collection('active-games')
        existing_games = active_games_collection.where('gameId', '==', game_id).limit(1).stream()
        if existing_games:
            for game_doc in existing_games:
                game_data = game_doc.to_dict()
                game_data['gameEnded'] = game_ended
                active_games_collection.document(game_doc.id).update(game_data)
        return "",204

    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503


def join_game_as_team(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))
    try:
        team_name = request.json.get('teamName')
        trivia_id = request.json.get('triviaId')

        if not team_name or not trivia_id:
            # Return a 400 Bad Request error if emailId or triviaId is missing
            response = jsonify({'error': 'Both teamName and triviaId parameters are required.'})
            return add_cors_headers(response), 400

        # Check if the 'active-games' collection exists, and create it if not present

        active_games_collection = db.collection('active-games')

        # Generate a new game ID
        game_id = str(uuid.uuid4())

        # Calculate the start timestamp (10 minutes from the current time)
        start_timestamp = datetime.now() + timedelta(minutes=10)

        # Check if the game already exists
        existing_games = active_games_collection.where('triviaId', '==', trivia_id).where("gameEnded","==",False).limit(1).stream()
        if existing_games:
            for game_doc in existing_games:
                game_data = game_doc.to_dict()
                participant_teams = game_data.get('participantTeams', [])
                if team_name in participant_teams:
                    response = jsonify({'message': 'Team already registered.', 'gameId': game_doc.id})
                    return add_cors_headers(response), 200
                
                participant_teams.append(team_name)
                game_data['participantTeams'] = participant_teams
                active_games_collection.document(game_doc.id).update(game_data)

                # Log the join game activity
                logging.info(f"Added team {team_name} to existing game {game_doc.id}")

                response = jsonify({'message': 'Successfully joined the game.', 'gameId': game_doc.id})
                return add_cors_headers(response), 200

        trivia_data = get_document_by_id('Trivia',trivia_id)
        if trivia_data:
            # Create a new game document in the active-games collection
            game_data = {
                'gameId': game_id,
                'triviaId': trivia_id,
                'timeFrames':trivia_data.get('timeframe') ,  # Set the appropriate value for time frames
                'startTimestamp': format_timestamp(start_timestamp),
                'isStarted': False,
                'participantTeams': [team_name],
                'participantEmails':[],
                'gameEnded':False,
                'category':trivia_data.get('category')
            }

            active_games_collection.document(game_id).set(game_data)

            # Log the join game activity
            logging.info(f"Created new game {game_id} with team {team_name}")

            response = jsonify({'message': 'Successfully joined the game.', 'gameId': game_id})
            return add_cors_headers(response), 200
        else:
            # Return a 404 Not Found error if the trivia with the provided triviaId is not found
            response = jsonify({'error': 'Trivia not found.'})
            return add_cors_headers(response), 404

    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503


def active_games(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))
    try:
        games=[]
        query = db.collection('active-games').where("gameEnded","==",False).stream()
        if query:
            for game_doc in query:
                game_data = game_doc.to_dict()
                trivia_id = game_data.get('triviaId')
                trivia_data = get_document_by_id('Trivia',trivia_id)
                trivia_info=None
                game_resp=None
                if trivia_data:
                        trivia_info = {
                        'triviaId': trivia_id,
                        'triviaName': trivia_data.get('triviaName', ''),
                        'categoryName': trivia_data.get('category', ''),
                        'difficultyLevel': trivia_data.get('difficultyLevel', ''),
                        'timeFrame': trivia_data.get('timeframe', 0),
                        'shortDescription': trivia_data.get('shortDescription', ''),
                        }
                        is_game_started,time_remaining,is_game_ended=get_remaining_time(parse_timestamp(game_data['startTimestamp']),trivia_data.get('timeframe', 0))
                        game_resp = {
                            'gameId': game_data.get('gameId'),
                            'trivia': trivia_info,
                            'timeRemaining':time_remaining,
                            'isGameStarted': is_game_started,
                            'isGameEnded':is_game_ended,
                            'participantEmails': game_data.get('participantEmails'),
                            'participantTeams': game_data.get('participantTeams'),

                        }
                        games.append(game_resp)
        response = jsonify({'games': games})
        return add_cors_headers(response), 200
    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503



def get_game_details_by_id(request):
    if request.method == 'OPTIONS':  # Handle pre-flight requests
        return add_cors_headers(jsonify({}))
    email_id = request.json.get('emailId')
    game_id = request.json.get('gameId')
    team_name = request.json.get('teamName')

    if not (email_id or team_name)  or not game_id:
        # Return a 400 Bad Request error if emailId or triviaId is missing
        response = jsonify({'error': 'Both emailId and gameId parameters are required.'})
        return add_cors_headers(response), 400

    try:
        active_games_collection = db.collection('active-games')
        existing_games = active_games_collection.where('gameId', '==', game_id).limit(1).stream()
        game_resp=None
        if existing_games:
            for game_doc in existing_games:
                game_data = game_doc.to_dict()
                participant_emails = game_data.get('participantEmails', [])
                participant_teams = game_data.get('participantTeams', [])
                if (email_id not in participant_emails) and (team_name not in participant_teams):
                    response = jsonify({'message': 'Please sign up for the game to play.'})
                    return add_cors_headers(response), 400
                
                trivia_id = game_data.get('triviaId')
                trivia_data = get_document_by_id('Trivia',trivia_id)
                trivia_info=None
                if trivia_data:
                        questions=trivia_data.get('questions', [])
                        questionDetails=[]
                        for questionId in questions:
                            question=get_document_by_id("Questions",questionId)
                            correctOption="Option"+str.upper(question.get('Answer', ""))
                            question_info = {
                            'questionId': questionId,
                            'text': question.get('Question', ''),
                            'options': [question.get('OptionA', ''),question.get('OptionB', ''),question.get('OptionC', ''),question.get('OptionD', ''),],
                            'correctAnswer': question.get(correctOption, ''),
                            'explanation': question.get('Explanation', ""),
                            }
                            questionDetails.append(question_info)
                        trivia_info = {
                        'triviaId': trivia_data.get('id'),
                        'triviaName': trivia_data.get('triviaName', ''),
                        'categoryName': trivia_data.get('category', ''),
                        'difficultyLevel': trivia_data.get('difficultyLevel', ''),
                        'timeFrame': trivia_data.get('timeframe', 0),
                        'shortDescription': trivia_data.get('shortDescription', ''),
                        'questions':questionDetails,
                        }
                        

                is_game_started,time_remaining,is_game_ended=get_remaining_time(parse_timestamp(game_data['startTimestamp']),trivia_data.get('timeframe', 0))
                game_resp = {
                    'gameId': game_data.get('gameId'),
                    'trivia': trivia_info,
                    'timeRemaining':time_remaining,
                    'isGameStarted': is_game_started,
                    'isGameEnded':is_game_ended,
                    'participantEmails': game_data.get('participantEmails'),

                }

        response = jsonify(game_resp)
        return add_cors_headers(response), 200
    except Exception as e:
        # Log the error and return a 503 Service Unavailable error
        logging.error(str(e))
        response = jsonify({'error': 'Service Unavailable'})
        return add_cors_headers(response), 503

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

