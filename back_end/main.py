from flask import Flask, jsonify
from team_name_generator import team_name_generator_app
from confirm_team_name import confirm_team_name_app
# from invite_users import invite_users_app
# from invite_users_v2 import invite_users_app_v2

from invite_users_v3 import invite_users_app_v3

# from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

# team_name_generator
# Register team name generator app
app.register_blueprint(team_name_generator_app)

# Register confirm team name app
app.register_blueprint(confirm_team_name_app)

# Register invite users app
app.register_blueprint(invite_users_app_v3)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
