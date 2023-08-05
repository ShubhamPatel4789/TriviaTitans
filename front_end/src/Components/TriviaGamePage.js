import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ChatComponent from './ChatComponent';
import { useSearchParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
  },
  timerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  questionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '40%',
  },
  scoresContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '30%',
  },
  timer: {
    marginBottom: theme.spacing(2),
  },
  question: {
    marginBottom: theme.spacing(2),
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
  },
  option: {
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  answerContainer: {
    marginTop: theme.spacing(4),
    textAlign: 'center',
  },
  answer: {
    marginBottom: theme.spacing(2),
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
  },
  message: {
    marginBottom: theme.spacing(1),
  },
  sender: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  ownMessage: {
    color: 'red',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
}));

const TriviaGamePage = () => {
  const classes = useStyles();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [teamScore, setTeamScore] = useState({});
  const [individualScore, setIndividualScore] = useState({});
  const [isAnsweringAllowed, setIsAnsweringAllowed] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLobbyMessageSent, setLobbyMessageSent] = useState(false);
  const [teamName, setTeamName] = useState(null);


  const[isTeamGame,setIsTeamGame]=useState(null);
  const[gameData,setGameData]=useState(null)
  const [searchParams, setSearchParams] = useSearchParams();
  const gameId=searchParams.get("gameId")
  const [teamGameSocket,setTeamGameSocket]=useState(null)
  const [teamPlayersInLobby,setTeamPlayersInLobby]=useState([])
  const [teamPlayersGameStarted,setTeamPlayersGameStarted]=useState([])
  const [socket1, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const emailId = localStorage.getItem('email');
  const [isGameOverForAll, setIsGameOverForAll] = useState(false);
  const [podiumPlaces, setPodiumPlaces] = useState([]);
  const[teamDetails,setTeamDetails]=useState({});
  const [teamDetailsFetched, setTeamDetailsFetched] = useState(false);


  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const email = localStorage.getItem('email');
        const payload = { email };
        const response = await fetch('https://8qv04lo2b2.execute-api.us-east-1.amazonaws.com/get-team-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team details');
        }

        const data = await response.json();
        setTeamDetails(data);
        setIsTeamGame(data.isPartOfTeam)
        setTeamName(data.teamName)
        setTeamDetailsFetched(true)
      } catch (error) {
        console.error(error);

        // Handle the error here (e.g., display an error message)
      }
      setTeamDetailsFetched(true)


    };
    if(!teamDetailsFetched){
      fetchTeamDetails();
    }

  }, [teamDetailsFetched]);


  const inLobbySendMessage = (socketConnection,state) => {
    const payload = {
      action: "gameplay",
      message: {email:emailId,state:state},
    };


    if (socketConnection && socketConnection.readyState === WebSocket.OPEN) {
      socketConnection.send(JSON.stringify(payload));
    }
    setLobbyMessageSent(true)
  };

  const questionAnsweredMessage = (isCorrect) => {
    const payload = {
      action: "gameplay",
      message: {action:"answered",isCorrect:isCorrect},
    };

    if (teamGameSocket && teamGameSocket.readyState === WebSocket.OPEN) {
      teamGameSocket.send(JSON.stringify(payload));
    }
  };

  const nextQuestionMessage = () => {
    const payload = {
      action: "gameplay",
      message: {action:"nextQuestion"},
    };

    if (teamGameSocket && teamGameSocket.readyState === WebSocket.OPEN) {
      teamGameSocket.send(JSON.stringify(payload));
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const sendMessage = (message) => {
    const payload = {
      action: "sendmessage",
      message: message,
    };

    if (teamGameSocket && teamGameSocket.readyState === WebSocket.OPEN) {
      teamGameSocket.send(JSON.stringify(payload));
    }
    setMessages((prevMessages) => [...prevMessages, {"email":emailId,"message":message}]);
  };

  useEffect(() => {

    if(isTeamGame){
      const socketConnection = new WebSocket(
        'wss://3p2u6ghz7j.execute-api.us-east-2.amazonaws.com/production?teamName=' +
          teamName +
          '&emailId=' +
          emailId
      );
  
      socketConnection.onopen = () => {
        setTeamGameSocket(socketConnection);
        if(!isLobbyMessageSent){
          inLobbySendMessage(socketConnection,"inLobby")
        }

      };
  
      socketConnection.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        if (message.messageType==="preGame"){
          setTeamPlayersInLobby(message.inLobby);
          setTeamPlayersGameStarted(message.startedGame)
          handleTeamMemberJoin(message.startedGame,message.inLobby);
          
  
        }
        else if (message.messageType==="chat"){
          setMessages((prevMessages) => [...prevMessages, message]);


  
        }
        else if (message.messageType==="answered"){
          console.log(gameData)

          setIsAnswered(true);
          
          setIsCorrect(message.isCorrect);
          setShowAnswer(true);

  
        }
        else if (message.messageType==="nextQuestion"){
          
          console.log(gameData)
          setSelectedOption('');
          setIsAnswered(false);
          setShowAnswer(false);
          setQuestionTimer(0);
          setIsTimerExpired(false);
      
          if (currentQuestion < gameData.trivia.questions.length - 1) {
            setCurrentQuestion((prevQuestion) => prevQuestion + 1);
          } else {
            setGameEnded(true)
            
          }
        }


      };
  
      return () => {
        if (socketConnection) {
          socketConnection.close();
        }
      };

    }

  }, [isTeamGame,showAnswer]);

  useEffect(() => {
    // Function to fetch the game data from the API
    const fetchGameDataFromAPI = async () => {
      try {
        // Modify the URL to match your API endpoint for fetching game data
        const response = await fetch('https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-activeGameDetailsById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId: gameId, emailId: emailId || null, teamName: teamName || null }),
        });

        if (!response.ok) {
          // Handle API error if needed
          console.error('Error fetching game data from API:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setGameData(data); // Set the fetched game data to the state
        if (teamDetails.isPartOfTeam && data.participantTeams.includes(teamDetails.teamName)) {
          setIsTeamGame(true);

          // Check if the user is an admin
          if (!teamDetails.IsTeamAdmin) {
            // User is not an admin, disable answering questions
            setIsAnsweringAllowed(false);
            console.log(isAnsweringAllowed)
          }
        }
        setGameStarted(true);
      } catch (error) {
        // Handle any other errors that may occur during the fetch
        console.error('Error fetching game data:', error);
      }
    };

    if (gameStarted&&!gameData) {
      fetchGameDataFromAPI();
    }
  }, [gameData, emailId, teamName,gameStarted,isAnsweringAllowed]);


    // Function to update the score on the server
const updateScoreOnServer = async (email, teamName,correctAnswer, answered, currentQuestion,isGameOver) => {
      let body=""
      if(isTeamGame){
        body=JSON.stringify({
          teamName,
          gameId: gameData.gameId,
          correctAnswer,
          answered,
          currentQuestion,
          isGameOver
        })
      }
      else{
        body=JSON.stringify({
          email,
          gameId: gameData.gameId,
          correctAnswer,
          answered,
          currentQuestion,
          isGameOver
        })
        
      }
      try {
        const response = await fetch('https://xzxo8tehe5.execute-api.us-east-1.amazonaws.com/dev/updateScore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        });
  
        if (!response.ok) {
          // Handle API error if needed
          console.error('Error updating score on server:', response.status, response.statusText);
        }
      } catch (error) {
        // Handle any other errors that may occur during the fetch
        console.error('Error updating score:', error);
      }
};
  useEffect(() => {
    if(gameData && gameStarted){
      if (!isAnswered && !showAnswer) {
        setQuestionTimer((gameData.trivia.timeFrame*60)/10);
        const timer = setInterval(() => {
          setQuestionTimer((prevTimer) => {
            if (prevTimer === 1) {
              clearInterval(timer);
              setIsTimerExpired(true);

            


            if (isAnsweringAllowed){
            handleEvaluate();
            if (currentQuestion >= gameData.trivia.questions.length - 1) {
              updateScoreOnServer(emailId,teamName, false, false, currentQuestion,true);
            }else{
              updateScoreOnServer(emailId,teamName, false, false, currentQuestion,false);
            }

            }

              
            }
            return prevTimer - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
    }
  }
  }, [currentQuestion, isAnswered, showAnswer, gameData]);

  useEffect(() => {
    if(gameData){

        // Function to fetch scores from the API and set the state
    const fetchScoresFromAPI = async () => {
      try {
        const response = await fetch('https://xzxo8tehe5.execute-api.us-east-1.amazonaws.com/dev/fetchScore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId: gameData.gameId }),
        });

        if (!response.ok) {
          // Handle API error if needed
          console.error('Error fetching scores from API:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        setTeamScore(data.score.teamScore || {});
        setIndividualScore(data.score.individualScore || {});
      } catch (error) {
        // Handle any other errors that may occur during the fetch
        console.error('Error fetching scores:', error);
      }
    };

    // Call the fetchScoresFromAPI function to populate the scores
    fetchScoresFromAPI();
    // Create a WebSocket connection
    const socketUrl = 'wss://5a0bu9svjd.execute-api.us-east-2.amazonaws.com/production?gameId=' + gameData.gameId;
    const socket = new WebSocket(socketUrl);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // Event listener for receiving messages from the WebSocket
    socket.onmessage = (event) => {
      try {

        const data = JSON.parse(event.data);
        if (data.score.teamScore) {
          setTeamScore(data.score.teamScore);
        }
        if (data.score.individualScore) {
          setIndividualScore(data.score.individualScore);
        }
        if (data.isGameOver && data.podiumPlaces.length>0){
          setPodiumPlaces(data.podiumPlaces)
          setIsGameOverForAll(data.isGameOver)

          console.log(data.podiumPlaces)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
    }
  }, [gameData]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsAnswered(true);
    setShowAnswer(true);
    handleEvaluate(option);

  };

  const handleNextQuestion = () => {
    if(isTeamGame &&isAnsweringAllowed){
      nextQuestionMessage()
    }
    setSelectedOption('');
    setIsAnswered(false);
    setShowAnswer(false);
    setQuestionTimer(0);
    setIsTimerExpired(false);

    if (currentQuestion < gameData.trivia.questions.length - 1) {
      setCurrentQuestion((prevQuestion) => prevQuestion + 1);
    } else {

      setGameEnded(true)
      
    }
  };

  const handleEvaluate = (option) => {

    if (isAnsweringAllowed){
      const currentQuestionData = gameData.trivia.questions[currentQuestion];
      const isCorrectAnswer = option === currentQuestionData.correctAnswer;
      setIsCorrect(isCorrectAnswer);
      
      if (isTeamGame){
        questionAnsweredMessage(isCorrectAnswer)
      }
      setShowAnswer(true);
      if (option!=null){
        // Call the updateScoreOnServer function with the necessary parameters
        if (currentQuestion >= gameData.trivia.questions.length - 1) {
          updateScoreOnServer(emailId, teamName,isCorrectAnswer, true, currentQuestion,true);
        }else{
          updateScoreOnServer(emailId, teamName,isCorrectAnswer, true, currentQuestion,false);
        }

      }

    }

  };

  const renderScoreTable = () => {
    // Create a combined score array for both teams and individuals
    const combinedScores = [
      ...Object.entries(individualScore).map(([email, score]) => ({ name: email, score, isTeam: false })),
      ...Object.entries(teamScore).map(([team, score]) => ({ name: team, score, isTeam: true })),
    ];

    // Sort the combinedScores array in descending order based on the score
    combinedScores.sort((a, b) => b.score - a.score);

    return (
      <div>
        <Typography variant="h6">Current Scores</Typography>
        {combinedScores.map((entry, index) => (
          <Typography key={index} variant="body1">
            {`${entry.isTeam ? 'Team' : 'Individual'}: ${entry.name} - Score: ${entry.score}`}
          </Typography>
        ))}
      </div>
    );
  };
  const [playersNotStarted, setPlayersNotStarted] = useState([]);

  const handleStartGame = () => {
    
    inLobbySendMessage(teamGameSocket,"startedGame");
    if (!isTeamGame){
      setGameStarted(true);
    }


  };

  const handleTeamMemberJoin = (teamPlayersGameStarted,teamPLayerInLobby) => {
    

    const notStartedPlayers = teamDetails.teamMembers.filter(
      (member) => !teamPlayersGameStarted.includes(member)
    );

    if (notStartedPlayers.length > 0) {
      setPlayersNotStarted(notStartedPlayers);
    } else{
      setGameStarted(true);
    }



  };

  const chatGameRender=() =>{
    return (
      <div className={classes.chatContainer}>
        <div className={classes.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${classes.message} ${
                message.email === localStorage.getItem('email') ? classes.ownMessage : ''
              }`}
            >
              <span className={classes.sender}>{message.email === localStorage.getItem('email') ? 'Me:' : message.email} </span>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
        <div className={classes.inputContainer}>
          <TextField
            className={classes.input}
            variant="outlined"
            label="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </div>
      </div>
    );
    
  }


const Podium = () => {
  return (
    <>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Typography variant="h4" style={{ marginBottom: '20px' }}>
            Game Over
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* First Place */}
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Winner
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                {podiumPlaces[0].participant}
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Score: {podiumPlaces[0].score}
              </Typography>
            </div>
          
            {/* Second Place */}
            {podiumPlaces.length >= 2 && (
            <div style={{ textAlign: 'center', marginLeft: '50px' }}>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Second Place
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                {podiumPlaces[1].participant}
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                Score: {podiumPlaces[1].score}
              </Typography>
            </div>
            )}
            {/* Third Place */}
            {podiumPlaces.length >= 3 && (
              <div style={{ textAlign: 'center', marginLeft: '50px' }}>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Third Place
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                  {podiumPlaces[2].participant}
                </Typography>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Score: {podiumPlaces[2].score}
                </Typography>
              </div>
            )}
          </div>
        </div>

    </>
  );
};




  const currentQuestionData = gameData?.trivia?.questions[currentQuestion];
  const currentUserScore = isTeamGame ? teamScore[teamName] : individualScore[emailId];

  if (!teamDetailsFetched) {
    return <div>Loading...</div>;
  }
  return (

    
    <div className={classes.root}>
      {!gameStarted && (
      <Button variant="contained" color="primary" onClick={handleStartGame}>
          Start Game
        </Button>
      
      )}
      {playersNotStarted.length > 0 && !gameStarted &&(
        <Typography variant="body1">
          Please wait for all players to start the game. Players who have not started: {playersNotStarted.join(', ')}
        </Typography>
      )}
            {gameStarted && !gameData && (
     <div>Loading...</div>
      )}

{gameEnded && gameStarted && !gameData && (
             <div>{renderScoreTable()}

             </div>
      )}

      {gameEnded && !isGameOverForAll &&  (
      <div>
          <Typography variant="h4" style={{ marginBottom: '10px' }}>
            Game Over
          </Typography>
          <Typography variant="subtitle1" style={{ marginBottom: '20px' }}>
            Please wait for all players to complete the game.
          </Typography>
      {renderScoreTable()}
      
      </div>

      )}

    {gameEnded && isGameOverForAll &&  (
      <div>
          {Podium()}
      </div>

      )}

      
      {gameStarted&&!gameEnded && gameData&&  (
        <>
      <Box className={classes.container}>
        <div className={classes.scoresContainer}>
          <Typography variant="h6">
            {isTeamGame ? `Team ${teamName}` : emailId}
          </Typography>
          <Typography variant="h6">
            {isTeamGame
              ? `Score: ${currentUserScore || 0}`
              : `Score: ${currentUserScore || 0}`}
          </Typography>
        </div>
        <div className={classes.timerContainer}>
          <Typography variant="h6" className={classes.timer}>
            Game Timer: {gameData.timeRemaining}
          </Typography>
          <Typography variant="h6" className={classes.timer}>
            Question Timer: {questionTimer} seconds
          </Typography>
        </div>
        <div className={classes.questionContainer}>
          {!isTimerExpired && !isAnswered && !gameEnded && (
            <>
              <Typography variant="h5" className={classes.question}>
                {currentQuestionData.text}
              </Typography>
              {!isAnswered && (
                <div className={classes.options}>
                  {currentQuestionData.options.map((option) => (
                    <Button
                      key={option}
                      variant="outlined"
                      className={classes.option}
                      onClick={() => isAnsweringAllowed && handleOptionSelect(option)}
                      disabled={!isAnsweringAllowed}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
              {isAnswered && !showAnswer && (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleEvaluate}
                >
                  Submit
                </Button>
              )}
            </>
          )}
          {(isAnswered || isTimerExpired )&& showAnswer && !gameEnded &&  (
                        <div className={classes.answerContainer}>
                        <Typography variant="h6" className={classes.answer}>
                          {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </Typography>
                        <Typography variant="body1">
                          Explanation: {currentQuestionData.explanation}
                        </Typography>
                        <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleNextQuestion}
            >
              Next
            </Button>
                      </div>

          )}
        </div>
        <div className={classes.scoresContainer}>
          <Typography variant="h6">Scores</Typography>
          {/* Individual Scores */}
          {Object.keys(individualScore).map((email) => (
            <Typography key={email} variant="body1">
              {email} - {individualScore[email]}
            </Typography>
          ))}
          {/* Team Scores */}
          {Object.keys(teamScore).map((team) => (
            <Typography key={team} variant="body1">
              {team} - {teamScore[team]}
            </Typography>
          ))}
        </div>
      </Box>

      </>
      )}
      {!gameEnded &&isTeamGame&& teamGameSocket&&(
                   chatGameRender()

                 


      )}
    </div>
  );
  
};

export default TriviaGamePage;
