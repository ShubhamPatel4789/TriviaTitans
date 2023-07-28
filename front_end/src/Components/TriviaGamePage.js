import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ChatComponent from './ChatComponent';
import { useSearchParams } from 'react-router-dom';

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
  const [isAnsweringAllowed, setIsAnsweringAllowed] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const teamName = localStorage.getItem('teamName');
  const emailId = localStorage.getItem('email');
  const[isTeamGame,setIsTeamGame]=useState(teamName!==null);
  const[gameData,setGameData]=useState(null)
  const [searchParams, setSearchParams] = useSearchParams();
  const gameId=searchParams.get("gameId")

  const teamDetails={isPartOfTeam:true,
  teamName:"team1",
  IsTeamAdmin:true,
  teamMembers:["lp6126@gmail.com","jp6126@gmail.com"]}


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
          if (!teamDetails.isAdmin) {
            // User is not an admin, disable answering questions
            setIsAnsweringAllowed(false);
          }
        }
        setGameStarted(true);
      } catch (error) {
        // Handle any other errors that may occur during the fetch
        console.error('Error fetching game data:', error);
      }
    };

    if (!gameData) {
      fetchGameDataFromAPI();
    }
  }, [gameData, emailId, teamName]);


    // Function to update the score on the server
const updateScoreOnServer = async (email, teamName,correctAnswer, answered, currentQuestion) => {
      let body=""
      if(isTeamGame){
        body=JSON.stringify({
          teamName,
          gameId: gameData.gameId,
          correctAnswer,
          answered,
          currentQuestion,
        })
      }
      else{
        body=JSON.stringify({
          email,
          gameId: gameData.gameId,
          correctAnswer,
          answered,
          currentQuestion,
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
    if(gameData){
      if (!isAnswered && !showAnswer) {
        setQuestionTimer(gameData.trivia.timeFrame);
        const timer = setInterval(() => {
          setQuestionTimer((prevTimer) => {
            if (prevTimer === 1) {
              clearInterval(timer);
              setIsTimerExpired(true);
              handleEvaluate();
            // Call the updateScoreOnServer function with the necessary parameters
            updateScoreOnServer(emailId,teamName, false, false, currentQuestion);
              
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
        setTeamScore(data.teamScore || {});
        setIndividualScore(data.individualScore || {});
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

    // Event listener for receiving messages from the WebSocket
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.teamScore) {
          setTeamScore(data.teamScore);
        }
        if (data.individualScore) {
          setIndividualScore(data.individualScore);
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
    const currentQuestionData = gameData.trivia.questions[currentQuestion];
    const isCorrectAnswer = option === currentQuestionData.correctAnswer;
    setIsCorrect(isCorrectAnswer);
    setShowAnswer(true);
    if (option!=null){
      // Call the updateScoreOnServer function with the necessary parameters
      updateScoreOnServer(emailId, teamName,isCorrectAnswer, true, currentQuestion);
    }
  };
  const renderGameContent = () => {
    if (!gameStarted) {
      // Show the Start button until the game has started
      return (
        <div>
          <Button variant="contained" color="primary" onClick={handleStartGame}>
            Start Game
          </Button>
        </div>
      );
    } else if (gameStarted && !gameData) {
      // Show the loading screen until the game data is fetched
      return <div>Loading...</div>;
    } else {
      // Show the game content when the game has started and data is available
      // ... (Render the game content as before)
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
        <Typography variant="h6">Scores</Typography>
        {combinedScores.map((entry, index) => (
          <Typography key={index} variant="body1">
            {`${entry.isTeam ? 'Team' : 'Individual'}: ${entry.name} - Score: ${entry.score}`}
          </Typography>
        ))}
      </div>
    );
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };
  if (!gameStarted) {
    // Show the Start button until the game has started
    return (
      <div>
        <Button variant="contained" color="primary" onClick={handleStartGame}>
          Start Game
        </Button>
      </div>
    );
  } else if (gameStarted && !gameData) {
    // Show the loading screen until the game data is fetched
    return <div>Loading...</div>;
  }
  else if (gameEnded && gameStarted && !gameData) {
    // Show the loading screen until the game data is fetched
    return (
    <div className={classes.root}>
        <div>{renderScoreTable()}</div>
      </div>
      );
  }

  const currentQuestionData = gameData.trivia.questions[currentQuestion];
  const currentUserScore = isTeamGame ? teamScore[teamName] : individualScore[emailId];


  return (
    <div className={classes.root}>
      {gameEnded && (
      <div>
                <Typography variant="h4" >
                Game Over
              </Typography>
      {renderScoreTable()}
      
      </div>

      )}

      
      {!gameEnded && (
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
                      onClick={() => handleOptionSelect(option)}
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
      <ChatComponent></ChatComponent>
      </>
      )}
    </div>
  );
  
};

export default TriviaGamePage;
