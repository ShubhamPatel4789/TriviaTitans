from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import cross_origin

# Initialize Firebase credentials and app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Define a function to delete a category and its associated data
@cross_origin()
def delete_category(request):
    try:
        # Get the 'category' parameter from the request URL
        category = request.args.get('category')

        # Get a reference to the category document in the 'Category' collection
        category_ref = db.collection('Category').document(category)

        # Get the ID of the category document
        category_id = category_ref.id

        # Delete the category document
        category_ref.delete()

        # Query and delete all question documents associated with the category
        questions_ref = db.collection('Questions').where('CategoryID', '==', category_id).stream()
        for question_doc in questions_ref:
            question_doc.reference.delete()

        # Return a success message as JSON response
        return jsonify({'message': 'Category and associated data deleted successfully'})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
