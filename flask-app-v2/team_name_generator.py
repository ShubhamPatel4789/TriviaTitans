from flask import Flask, jsonify, request, Blueprint
import openai
# from flask_cors import CORS, cross_origin
import boto3

app = Flask(__name__)

team_name_generator_app = Blueprint('team_name_generator_app', __name__)


@team_name_generator_app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Set OpenAI API key
# openai.api_key = os.environ["OPENAI_API_KEY"]
# openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = "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"

# Create DynamoDB client
dynamodb = boto3.client('dynamodb')


@team_name_generator_app.route("/generate-team-name", methods=["POST"])
def generate_team_name():
    # prompt = "Generate a UNIQUE and CREATIVE team name for a quiz game with only one word"
    prompt = "Generate a UNIQUE and CREATIVE team name for a quiz game with only one word. The team name should:\n" \
             "- Start with only letters, can containe numbers\n" \
             "- Contain at least 6 characters\n" \
             "- limit is maximum 2 words\n" \
             "- Use a combination of uppercase and lowercase letters\n" \
             "- Avoid using common English words or phrases"
    response = generate_gpt3_response(prompt)
    response = response.replace('\n', '')
    
    # Check if the generated name already exists in DynamoDB
    team_name_exists = check_team_name_exists(response)
    while team_name_exists:
        response = generate_gpt3_response(prompt)
        response = response.replace('\n', '')
        team_name_exists = check_team_name_exists(response)
    
    # Return the generated name
    return jsonify(response), 200

def generate_gpt3_response(user_text, print_output=False):
    completions = openai.Completion.create(
        engine='text-davinci-003',
        temperature=0.5,
        prompt=user_text,
        max_tokens=100,
        n=1,
        stop=None,
    )

    if print_output:
        print(completions)

    return completions.choices[0].text
    # return completions

def check_team_name_exists(team_name):
    response = dynamodb.get_item(
        TableName='Teams',
        Key={
            'teamName': {'S': team_name}
        }
    )
    return 'Item' in response