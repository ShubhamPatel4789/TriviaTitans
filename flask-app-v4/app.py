from flask import Flask, jsonify, make_response

from team_name_generator import team_name_generator_app
from confirm_team_name import confirm_team_name_app
from invite_users import invite_users_app
from api_calls import api_calls_app

app = Flask(__name__)

# Register team name generator app
app.register_blueprint(team_name_generator_app)

# Register confirm team name app
app.register_blueprint(confirm_team_name_app)

# Register invite users app
app.register_blueprint(invite_users_app)

# Register api calls app
app.register_blueprint(api_calls_app)

@app.route("/")
def hello_from_root():
    return jsonify(message='Hello from root!')


@app.route("/hello")
def hello():
    return jsonify(message='Hello from path!')


@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error='Not found!'), 404)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
