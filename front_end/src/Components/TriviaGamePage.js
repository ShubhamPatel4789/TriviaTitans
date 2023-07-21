import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ChatComponent from './ChatComponent';

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
  

  const teamName = localStorage.getItem('teamName');
  const emailId = localStorage.getItem('email');
  const[isTeamGame,setIsTeamGame]=useState(teamName!==null);


  const gameData = {
    gameId: 'game12345',
    isGameEnded: true,
    isGameStarted: true,
    participantEmails: ['lp6126@gmail.com', 'user@example.com'],
    timeRemaining: '-4238:41',
    trivia: {
      categoryName: 'sports',
      difficultyLevel: 'easy',
      shortDescription: 'legends of cricket',
      timeFrame: 5,
      triviaId: '123456',
      triviaName: 'legends',
      "questions": [
        {
          "questionId": "12345",
          "text": "Who is known as the 'Master Blaster' in cricket?",
          "options": ["Sachin Tendulkar", "Rahul Dravid", "Virender Sehwag", "Kapil Dev"],
          "correctAnswer": "Sachin Tendulkar",
          "explanation": "Sachin Tendulkar is known as the 'Master Blaster' due to his exceptional batting skills."
        },
        {
          "questionId": "12346",
          "text": "Which country won the first-ever Cricket World Cup in 1975?",
          "options": ["Australia", "West Indies", "England", "India"],
          "correctAnswer": "West Indies",
          "explanation": "West Indies won the inaugural Cricket World Cup held in 1975."
        },
        {
          "questionId": "12347",
          "text": "Who holds the record for the highest individual score in Test cricket?",
          "options": ["Don Bradman", "Brian Lara", "Sachin Tendulkar", "Virender Sehwag"],
          "correctAnswer": "Brian Lara",
          "explanation": "Brian Lara holds the record for the highest individual score in Test cricket with 400 runs."
        },
        {
          "questionId": "12348",
          "text": "Which cricketer has scored the most international runs in his career?",
          "options": ["Sachin Tendulkar", "Ricky Ponting", "Kumar Sangakkara", "Virat Kohli"],
          "correctAnswer": "Sachin Tendulkar",
          "explanation": "Sachin Tendulkar has scored the most international runs in his career."
        },
        {
          "questionId": "12349",
          "text": "Who is the only cricketer to have scored 10,000 runs or more in ODIs?",
          "options": ["Sachin Tendulkar", "Ricky Ponting", "Kumar Sangakkara", "Virat Kohli"],
          "correctAnswer": "Sachin Tendulkar",
          "explanation": "Sachin Tendulkar is the only cricketer to have scored 10,000 runs or more in One Day Internationals (ODIs)."
        },
        {
          "questionId": "12350",
          "text": "Which cricketer has taken the most wickets in Test cricket?",
          "options": ["Muttiah Muralitharan", "Shane Warne", "Anil Kumble", "Glenn McGrath"],
          "correctAnswer": "Muttiah Muralitharan",
          "explanation": "Muttiah Muralitharan has taken the most wickets in Test cricket with 800 wickets."
        },
        {
          "questionId": "12351",
          "text": "Who is the only cricketer to score a double century in a One Day International (ODI) match?",
          "options": ["Sachin Tendulkar", "Rohit Sharma", "Virender Sehwag", "Chris Gayle"],
          "correctAnswer": "Sachin Tendulkar",
          "explanation": "Sachin Tendulkar is the only cricketer to score a double century in a One Day International (ODI) match."
        },
        {
          "questionId": "12352",
          "text": "Which country has won the most Cricket World Cups?",
          "options": ["Australia", "India", "West Indies", "Pakistan"],
          "correctAnswer": "Australia",
          "explanation": "Australia has won the most Cricket World Cups, with a total of 5 titles."
        },
        {
          "questionId": "12353",
          "text": "Who is the current captain of the Indian cricket team?",
          "options": ["Virat Kohli", "Rohit Sharma", "KL Rahul", "Shikhar Dhawan"],
          "correctAnswer": "Virat Kohli",
          "explanation": "Virat Kohli is the current captain of the Indian cricket team."
        },
        {
          "questionId": "12354",
          "text": "Who is the fastest bowler in the history of cricket?",
          "options": ["Shoaib Akhtar", "Brett Lee", "Mitchell Johnson", "Jeff Thomson"],
          "correctAnswer": "Shoaib Akhtar",
          "explanation": "Shoaib Akhtar is considered the fastest bowler in the history of cricket."
        }
      ],
    },
  };

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
  }, [currentQuestion, isAnswered, showAnswer, gameData.trivia.timeFrame]);

  useEffect(() => {

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
  }, [gameData.gameId]);

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
      // Handle end of game logic
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

  const currentQuestionData = gameData.trivia.questions[currentQuestion];

  return (
    <div className={classes.root}>
      <Box className={classes.container}>
        <div className={classes.timerContainer}>
          <Typography variant="h6" className={classes.timer}>
            Game Timer: {gameData.timeRemaining}
          </Typography>
          <Typography variant="h6" className={classes.timer}>
            Question Timer: {questionTimer} seconds
          </Typography>
        </div>
        <div className={classes.questionContainer}>
          {!isTimerExpired && !isAnswered && (
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
          {(isAnswered || isTimerExpired )&& showAnswer && (
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
    </div>
  );
  
};

export default TriviaGamePage;
