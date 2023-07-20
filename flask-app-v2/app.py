from flask import Flask, jsonify, make_response, request
# from flask import Flask, jsonify, request
# from flask_cors import CORS
# from apscheduler.schedulers.background import BackgroundScheduler

from team_name_generator import team_name_generator_app
from confirm_team_name import confirm_team_name_app
# from invite_users import invite_users_app
from invite_users_v2 import invite_users_app_v2

app = Flask(__name__)


# team_name_generator
# Register team name generator app
app.register_blueprint(team_name_generator_app)

# Register confirm team name app
app.register_blueprint(confirm_team_name_app)

# Register invite users app
app.register_blueprint(invite_users_app_v2)

@app.route("/")
def hello_from_root():
    return jsonify(message='Hello from root!')


# @app.route("/hello")
# def hello():
#     return jsonify(message='Hello from hello!')


@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error='Not found!'), 404)
