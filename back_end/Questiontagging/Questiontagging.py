from flask import jsonify
from google.cloud import firestore
from google.cloud import language_v1

def categorize_question(question):
    client = language_v1.LanguageServiceClient()
    document = language_v1.Document(content=question, type_=language_v1.Document.Type.PLAIN_TEXT)
    response = client.classify_text(document=document)
    categories = [category.name for category in response.categories]
    # Split each category by slashes and flatten the list
    categories = [subcat for category in categories for subcat in category.split('/')]
    # Remove duplicates
    categories = list(set(categories))
    return categories


def tag_question(request):
    request_json = request.get_json()
    question = request_json.get('question')
    if not question:
        return jsonify({'error': 'Missing question'}), 400
    try:
        categories = categorize_question(question)
        db = firestore.Client()
        doc_ref = db.collection('Questions').document()  # Create a new document with a random ID
        doc_ref.set({'Question': question, 'Tags': categories})  # Set the 'Question' and 'Tags' fields
        return jsonify({'categories': categories})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

