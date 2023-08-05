import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify
from flask_cors import cross_origin

# Initialize Firebase credentials and app using Application Default Credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Define a function to retrieve all categories
@cross_origin()
def get_all_categories(request):
    try:
        # Get a reference to the 'Category' collection
        categories_ref = db.collection('Category')

        # Fetch all documents from the 'Category' collection
        categories = categories_ref.get()

        # Create a list of category IDs
        category_list = [category.id for category in categories]

        # Return the list of categories as a JSON response
        return jsonify({'categories': category_list})

    except Exception as e:
        # If an error occurs, return an error message with status code 400
        return jsonify({'error': str(e)}), 400
