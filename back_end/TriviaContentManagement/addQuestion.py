import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify
from flask_cors import cross_origin
import requests

# Initialize Firebase credentials and app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'sdp17-392601'
})

# Initialize Firestore client
db = firestore.client()

# Define a function to add a new question
@cross_origin()
def add_question(request):
    try:
        # Get JSON data from the request
        question_data = request.get_json()

        # Check if all required fields are present in the JSON data
        if not all(field in question_data for field in ['Category', 'Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'DifficultyLevel', 'Answer', 'Explanation']):
            raise ValueError('Incomplete question data')

        # Make a request to an external API to get tag confidence scores based on the question text
        response = requests.post('https://us-east1-sdp17-392601.cloudfunctions.net/question_tag_confidencescore', json={"question": question_data['Question']})
        response_data = response.json()

        # Add the obtained tags to the question data
        question_data['tags'] = response_data['categories']

        # Extract the category name and remove it from question_data
        category_name = question_data.pop('Category')

        # Get a reference to the specified category in Firestore
        category_ref = db.collection('Category').document(category_name)

        # Check if the specified category exists in the database
        if not category_ref.get().exists:
            raise ValueError(f"Category '{category_name}' does not exist")

        # Create a new document reference for the question
        question_ref = db.collection('Questions').document()

        # Add the CategoryID field to question_data with the ID of the category document
        question_data['CategoryID'] = category_ref.id

        # Set the question data in the Firestore document
        question_ref.set(question_data)

        # Return a success message as JSON response
        return jsonify({'message': 'Question added successfully'})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
