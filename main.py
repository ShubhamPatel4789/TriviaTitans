import firebase_admin
from firebase_admin import credentials
from flask import Flask
from question_management import question_app
from trivia_management import trivia_app

# Initialize Firebase
cred = credentials.Certificate("C:/Users/17827/Desktop/Serverless/ServerlessProjectBackend/serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

app = Flask(__name__)

# Register question management app
app.register_blueprint(question_app)

# Register trivia management app
app.register_blueprint(trivia_app)

if __name__ == '__main__':
    app.run()
