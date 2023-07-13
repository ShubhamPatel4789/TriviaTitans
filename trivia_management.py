import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS, cross_origin

cred = credentials.Certificate("C:/Users/17827/Desktop/Serverless/ServerlessProjectBackend/serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

trivia_app = Blueprint('trivia_app', __name__)


@cross_origin()
@trivia_app.route('/api/createtrivia', methods=['POST'])
def create_trivia():
    try:
        trivia_data = request.json

        # Validate trivia_data fields
        if not all(field in trivia_data for field in ['triviaName', 'category', 'difficultyLevel', 'timeframe', 'shortDescription']):
            raise ValueError('Incomplete trivia data')

        # Create a new trivia document
        trivia_ref = db.collection('Trivia').document()
        trivia_ref.set({
            'triviaName': trivia_data['triviaName'],
            'category': trivia_data['category'],
            'difficultyLevel': trivia_data['difficultyLevel'],
            'timeframe': trivia_data['timeframe'],
            'shortDescription': trivia_data['shortDescription'],
            'createdTimestamp': firestore.SERVER_TIMESTAMP
        })

        # Get the newly created trivia document ID
        trivia_id = trivia_ref.id

        # Get the questions with the provided category and difficulty level from the "Questions" collection
        questions_ref = db.collection('Questions').where('CategoryID', '==', trivia_data['category']) \
            .where('DifficultyLevel', '==', trivia_data['difficultyLevel']).stream()

        questions = [question.id for question in questions_ref]

        # Update the trivia document with the questions
        trivia_ref.update({'questions': questions})

        return jsonify({'message': 'Trivia game created successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 400
