import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from flask import jsonify
from flask_cors import cross_origin

# Initialize Firebase credentials and app with the given project ID
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'sdp17-392601'
})

# Initialize Firestore client
db = firestore.client()

# Define a function to edit/update a question
@cross_origin()
def edit_question(request):
    try:
        question_data = request.get_json()

        # Validate question_data fields (e.g., question, options, difficulty_level)
        if not all(field in question_data for field in ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'Answer', 'DifficultyLevel', 'Explanation']):
            raise ValueError('Incomplete question data')

        # Fetch the document ID from the query parameter
        document_id = request.args.get('document_id')

        # Get a reference to the question document in the 'Questions' collection
        question_ref = db.collection('Questions').document(document_id)

        # Check if the document ID exists
        document = question_ref.get()
        if document.exists:
            # Update the question with the provided information
            question_ref.update(question_data)
            # Return a success message as JSON response
            return jsonify({'message': 'Question updated successfully'})
        else:
            # Return a message indicating that the question document was not found with status code 404
            return jsonify({'message': 'Question document not found'}), 404

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
