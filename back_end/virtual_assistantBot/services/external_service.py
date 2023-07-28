import requests
import logging

# async def get_teams():
#     try:
#         response = requests.get('https://mjvsjlx9pa.execute-api.us-east-1.amazonaws.com/dev/api/teams/')
#         return response.json()
#     except Exception as error:
#         logging.error(error)

async def get_teams():
    try:
        # Hard code the game score value
        response = [
            {
                "name": "Team1",
                "pointsEarned": 100
            },
            {
                "name": "Team2",
                "pointsEarned": 200
            },
            # Add more teams as needed
        ]
        return response
    except Exception as error:
        logging.error(error)





team_list = [
        {
            'name': 'Team A',
            'pointsEarned': 10
        },
        {
            'name': 'Team B',
            'pointsEarned': 15
        },
        {
            'name': 'Team C',
            'pointsEarned': 8
        }
    ]