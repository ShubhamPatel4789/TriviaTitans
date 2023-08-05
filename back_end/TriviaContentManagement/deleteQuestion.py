from flask import jsonify
from flask_cors import cross_origin
from google.cloud import firestore

# Initialize Firestore client
db = firestore.Client()

# Define a function to delete a question
@cross_origin()
def delete_question(request):
    try:
        # Fetch the document ID from the query parameter
        document_id = request.args.get('document_id')

        # Get a reference to the question document in the 'Questions' collection
        question_ref = db.collection('Questions').document(document_id)

        # Check if the document ID exists
        document = question_ref.get()
        if document.exists:
            # Delete the question document
            question_ref.delete()
            # Return a success message as JSON response
            return jsonify({'message': 'Question deleted successfully'})
        else:
            # Return a message indicating that the question document was not found with status code 404
            return jsonify({'message': 'Question document not found'}), 404

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
