import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from flask import Flask,Blueprint, request, jsonify
from flask import Flask
from flask_cors import CORS, cross_origin


cred = credentials.Certificate("C:/Users/17827/Desktop/Serverless/ServerlessProjectBackend/serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


db = firestore.client()

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

question_app = Blueprint('question_app', __name__)


@question_app.route('/api/addquestions', methods=['POST'])
@cross_origin()
def add_question():
    try:
        question_data = request.json

        # Validate question_data fields (e.g., category, question, options, difficulty_level)
        if not all(field in question_data for field in ['Category', 'Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'DifficultyLevel', 'Answer','Explanataion']):
            raise ValueError('Incomplete question data')

        category_name = question_data['Category']
        question_data.pop('Category')  # Remove the Category field from question_data

        # Get the category document reference
        category_ref = db.collection('Category').document(category_name)

        # Check if the category exists
        if not category_ref.get().exists:
            raise ValueError(f"Category '{category_name}' does not exist")

        # Add the question to the Questions collection
        question_ref = db.collection('Questions').document()
        question_data['CategoryID'] = category_ref.id  # Pass the category document ID
        question_ref.set(question_data)

        return jsonify({'message': 'Question added successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 400





# Route for editing an existing trivia question
@question_app.route('/api/questions/<document_id>', methods=['PUT'])
@cross_origin()
def edit_question(document_id):
    try:
        question_data = request.json

        # Validate question_data fields (e.g., question, options, difficulty_level)
        if not all(field in question_data for field in ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'Answer', 'DifficultyLevel','Explanation']):
            raise ValueError('Incomplete question data')

        question_ref = db.collection('Questions').document(document_id)

        # Check if the document ID exists
        document = question_ref.get()
        if document.exists:
            # Update the question with the provided information
            question_ref.update(question_data)
            return jsonify({'message': 'Question updated successfully'})
        else:
            return jsonify({'message': 'Question document not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 400




# Route for deleting a trivia question
@question_app.route('/api/questions/<document_id>', methods=['DELETE'])
@cross_origin()
def delete_question(document_id):
    try:
        question_ref = db.collection('Questions').document(document_id)

        # Check if the document ID exists
        document = question_ref.get()
        if document.exists:
            # Delete the question
            question_ref.delete()
            return jsonify({'message': 'Question deleted successfully'})
        else:
            return jsonify({'message': 'Question document not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 400




# Route for retrieving all trivia questions
@question_app.route('/api/questions', methods=['GET'])
@cross_origin()
def get_all_questions():
    try:
        questions = []

        question_docs = db.collection('Questions').get()
        for question_doc in question_docs:
            question_data = question_doc.to_dict()
            question_data['id'] = question_doc.id  # Add the document ID to the question data
            questions.append(question_data)

        return jsonify({'questions': questions})

    except Exception as e:
        return jsonify({'error': str(e)}), 400




    
# Route for getting all categories
@question_app.route('/api/categories', methods=['GET'])
@cross_origin()
def get_all_categories():
    try:
        categories_ref = db.collection('Category')
        categories = categories_ref.get()
        category_list = [category.id for category in categories]

        return jsonify({'categories': category_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 400



# Route for adding a new category
@question_app.route('/api/addcategories', methods=['POST'])
@cross_origin()
def add_category():
    try:
        category_data = request.json

        # Validate category_data fields (e.g., Category)
        if 'Category' not in category_data:
            raise ValueError('Incomplete category data')

        category_name = category_data['Category']

        # Add the category to Firestore
        db.collection('Category').document(category_name).set({})

        return jsonify({'message': 'Category added successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Route for deleteing a category
@question_app.route('/api/categories/<category>', methods=['DELETE'])
@cross_origin()
def delete_category(category):
    try:

        category_ref = db.collection('Category').document(category)

        # Get the category ID
        category_id = category_ref.id

        # Delete the category document
        category_ref.delete()

        # Delete all the question documents associated with the category
        questions_ref = db.collection('Questions').where('CategoryID', '==', category_id).stream()
        for question_doc in questions_ref:
            question_doc.reference.delete()

        return jsonify({'message': 'Category and associated data deleted successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 400
