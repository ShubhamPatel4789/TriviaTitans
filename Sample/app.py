from flask import Flask, jsonify, request
import openai
from flask_cors import CORS

# app = Flask(__name__) # Initialize the Flask app
# CORS(app)
# CORS(app, methods=['GET', 'POST', 'PUT']) # Allow specific HTTP methods (e.g., GET, POST, PUT)
# CORS(app, headers=['Content-Type']) # Allow specific headers in the request
# CORS(app, supports_credentials=True) # Allow cookies to be included in cross-origin requests
# CORS(app, resources={r"/generate-team-name": {"origins": "*"}})

app = Flask(__name__)

@app.after_request
def add_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    return response

# Set OpenAI API key
# openai.api_key = os.environ["OPENAI_API_KEY"]
# openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = "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"


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
@app.route("/generate-team-name",methods=["POST"])
def generate_team_name():
    # user_prompt = request.json['userPrompt']
    # request_data = request.get_json()
    # print(request_data)
    # user_prompt = request_data['userPrompt']

    # print(request.headers)
    prompt = "Generate a UNIQUE and CREATIVE team name for a quiz game with only one word"#+user_prompt
    response = generate_gpt3_response(prompt)
    response = response.replace('\n', '')
    print(jsonify(response))
    return jsonify(response),200
    # return response,200
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
