import requests
import json

def fetch_teams():
    # Replace with your actual service to fetch teams
    # response = requests.get('http://example.com/teams')
    # team_list = response.json()

    return [
        {"name": "Team1", "pointsEarned": 100},
        {"name": "Team2", "pointsEarned": 200},
        {"name": "Team3", "pointsEarned": 150},
    ]

def fulfillment_handler(input_event, context):
    print('Received input_event:', json.dumps(input_event, indent=2))

    output_response = {
        "sessionState": {
            "intent": {
                "name": "FallbackIntent",
                "slots": {},
                "confirmationState": "None",
                "state": "Failed"
            },
            "dialogAction": {
                "type": "Close"
            },
            "sessionAttributes": {}
        },
        "messages": [{
            "contentType": "PlainText",
            "content": "Internal error: input_event.sessionState.intent is undefined."
        }],
        "requestAttributes": {}
    }

    if not input_event.get('sessionState') or not input_event['sessionState'].get('intent'):
        print('Error: input_event.sessionState.intent is undefined')
        return output_response

    output_response["sessionState"]["intent"]["name"] = input_event['sessionState']['intent']['name']
    output_response["sessionState"]["intent"]["slots"] = input_event['sessionState']['intent']['slots']

    if input_event['sessionState']['intent']['name'] == 'FetchTeamScore':
        input_team_name = input_event['sessionState']['intent']['slots']['teamName']['value']['originalValue']
        team_list = fetch_teams()
        print(team_list)
        print('line 15', input_team_name)
        found_team = next((team for team in team_list if team['name'] == input_team_name), None)

        if not found_team:
            print(f'Team not found: {input_team_name}')
            output_response['sessionState']['intent']['state'] = "Failed"
            output_response['messages'][0]['content'] = f"The team name you entered does not exist. Please enter a valid team name."
        else:
            print(f'Team: {json.dumps(found_team)}')
            output_response['sessionState']['intent']['state'] = "Fulfilled"
            output_response['messages'][0]['content'] = f"The score for team {found_team['name']} is {found_team['pointsEarned']}."

    elif input_event['sessionState']['intent']['name'] == 'GetSupportForNavigation':
        nav_request = input_event['sessionState']['intent']['slots']['navigationFor']['value']['originalValue']
        print(nav_request)
        nav_guide = {

            "game lobby": "Step 1: Login. Step 2: Go to MAIN MENUE. Step 3: Select 'Go to Games'. Step 4: Browse upcoming games. Step 5: Enter Lobby and Join the game you prefer",
            "gamelobby": "Step 1: Login. Step 2: Go to MAIN MENUE. Step 3: Select 'Go to Games'. Step 4: Browse upcoming games. Step 5: Enter Lobby and Join the game you prefer",
            "achievements": "Step 1: Login. Step 2: Click on 'Game Records'. Step 3: View game stats.",
            "leaderboards": "Step 1: Login. Step 2: Click on 'Game Records'. Step 3: View game stats.",
            "play a game": "Step 1: Login. Step2: Choose and Start your game. Step3: Choose category. Step4: View teams progress and Real-Time Stats.",
            "user profile": "Step 1: Login. Step 2: Select 'User Profile' from the side view bar. Step 3: Complete your profile and set a profile picture.",
            "userprofile": "Step 1: Login. Step 2: Select 'User Profile' from the side view bar. Step 3: Complete your profile and set a profile picture.",

        }

        nav_directions = nav_guide.get(nav_request.lower())

        if not nav_directions:
            print(f'Invalid navigation: {nav_request}')
            output_response['sessionState']['intent']['state'] = "Failed"
            output_response['messages'][0]['content'] = "Navigation does not exist for this."
        else:
            print(f'Navigation for: {nav_request}')
            output_response['sessionState']['intent']['state'] = "Fulfilled"
            output_response['messages'][0]['content'] = nav_directions

    return output_response
