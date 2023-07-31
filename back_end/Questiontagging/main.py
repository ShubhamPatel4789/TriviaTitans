# Import necessary libraries
from flask import jsonify
from google.cloud import firestore
from google.cloud import language_v1 

# Function to categorize a given question using Google Cloud Natural Language API 
def NLP_Category(question):
    # Initialize the LanguageServiceClient
    client = language_v1.LanguageServiceClient()
    # Use the client to classify the text of the document
    document = language_v1.Document(content=question, type_=language_v1.Document.Type.PLAIN_TEXT)
    response = client.classify_text(document=document)
    
    # Create a dictionary with categories as keys and confidence scores as values
    categories_with_scores = {}
    for category in response.categories:
        # Split each category at the slash and add each part to the set
        for subcategory in category.name.split('/'):
            # Skip if subcategory is empty string (which will be the case for the first part when splitting at '/')
            if not subcategory:
                continue
            if subcategory in categories_with_scores:
                categories_with_scores[subcategory] = max(categories_with_scores[subcategory], category.confidence)
            else:
                categories_with_scores[subcategory] = category.confidence

    return categories_with_scores



#################################################################################################################################
# Refered From
# Google Cloud, "Google Cloud Natural Language API," Google Cloud, [Online]. Available: https://cloud.google.com/natural-language/docs. [Accessed: 30-07-2023].
#####################################################################################################################################

# Function to tag a question with categories

def question_tag_confidencescore(request):
    request_json = request.get_json()
    question = request_json.get('question')
    if not question:
        return jsonify({'error': 'Missing question'}), 400
    try:
        # Categorize the question
        categories_with_scores = NLP_Category(question)
        # Return the categories and confidence scores as a JSON response
        return jsonify({'categories': categories_with_scores})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




