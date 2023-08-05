import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify, request
from flask_cors import cross_origin

# Initialize Firebase credentials and app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Define a function to add a new category
@cross_origin()
def add_category(request):
    try:
        # Get JSON data from the request
        category_data = request.get_json()

        # Check if 'Category' key exists in the JSON data
        if 'Category' not in category_data:
            raise ValueError('Incomplete category data')

        # Extract category name from JSON data
        category_name = category_data['Category']

        # Add the category to Firestore by creating a new document
        db.collection('Category').document(category_name).set({})

        # Return a success message as JSON response
        return jsonify({'message': 'Category added successfully'})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
