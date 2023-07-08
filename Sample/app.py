from flask import Flask, jsonify
import openai
import os

app = Flask(__name__)

# Set OpenAI API key
# openai.api_key = os.environ["OPENAI_API_KEY"]
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
@app.route("/generate-team-name",methods=["GET"])
def generate_team_name():
    prompt = "Generate a random team name for a quiz, with a maximum length of 2 words"
    response = generate_gpt3_response(prompt)
    # return jsonify({"team_name": response}),200
    return response,200
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
