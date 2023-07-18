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

  const gameData = {
    gameId: '06228e90-019f-4250-b1d5-30be7a3bc4f4',
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

  useEffect(() => {
    if (!isAnswered && !showAnswer) {
      setQuestionTimer(gameData.trivia.timeFrame);
      const timer = setInterval(() => {
        setQuestionTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(timer);
            setIsTimerExpired(true);
            handleEvaluate();
            
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestion, isAnswered, showAnswer, gameData.trivia.timeFrame]);

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
          <Typography variant="body1">lp6126@gmail.com - 100</Typography>
          <Typography variant="body1">user@example.com - 50</Typography>
          {/* Replace with actual scores data */}
        </div>
      </Box>
      <ChatComponent></ChatComponent>
    </div>
  );
  
};

export default TriviaGamePage;
