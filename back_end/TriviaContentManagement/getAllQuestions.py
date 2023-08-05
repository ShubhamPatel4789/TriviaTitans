from firebase_admin import credentials, firestore
from flask import jsonify
from flask_cors import cross_origin

# Initialize Firebase credentials and app using Application Default Credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

# Initialize Firestore database client
db = firestore.client()

# Define a function to retrieve all questions
@cross_origin()
def get_all_questions(request):
    try:
        questions = []

        # Retrieve all documents from the 'Questions' collection
        question_docs = db.collection('Questions').get()

        # Iterate through each question document
        for question_doc in question_docs:
            # Convert the document data to a Python dictionary
            question_data = question_doc.to_dict()

            # Add the document ID to the question data for identification
            question_data['id'] = question_doc.id
            questions.append(question_data)

        # Return the list of questions as a JSON response
        return jsonify({'questions': questions})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
