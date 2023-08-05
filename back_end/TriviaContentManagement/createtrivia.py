import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify, request
from flask_cors import cross_origin

# Initialize Firebase credentials and app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'sdp17-392601'
})

# Initialize Firestore client
db = firestore.client()

# Define a function to create a new trivia game
@cross_origin()
def create_trivia(request):
    try:
        # Get JSON data from the request
        trivia_data = request.json

        # Validate if all required fields are present in the JSON data
        if not all(field in trivia_data for field in ['triviaName', 'category', 'difficultyLevel', 'timeframe', 'shortDescription']):
            raise ValueError('Incomplete trivia data')

        # Create a new trivia document reference
        trivia_ref = db.collection('Trivia').document()

        # Set the trivia game details in the Firestore document
        trivia_ref.set({
            'triviaName': trivia_data['triviaName'],
            'category': trivia_data['category'],
            'difficultyLevel': trivia_data['difficultyLevel'],
            'timeframe': trivia_data['timeframe'],
            'shortDescription': trivia_data['shortDescription'],
            'createdTimestamp': firestore.SERVER_TIMESTAMP
        })

        # Get the ID of the newly created trivia document
        trivia_id = trivia_ref.id

        # Query the "Questions" collection for questions with the specified category and difficulty level
        questions_ref = db.collection('Questions').where('CategoryID', '==', trivia_data['category']) \
            .where('DifficultyLevel', '==', trivia_data['difficultyLevel']).stream()

        # Create a list of question IDs from the query results
        questions = [question.id for question in questions_ref]

        # Update the trivia document with the list of question IDs
        trivia_ref.update({'questions': questions})

        # Return a success message as JSON response
        return jsonify({'message': 'Trivia game created successfully'})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
