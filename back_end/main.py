from flask import Flask, jsonify
from flask_cors import CORS
from team_name_generator import team_name_generator_app
from confirm_team_name import confirm_team_name_app
app = Flask(__name__)

# team_name_generator
# Register team name generator app
app.register_blueprint(team_name_generator_app)

# Register confirm team name app
app.register_blueprint(confirm_team_name_app)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
