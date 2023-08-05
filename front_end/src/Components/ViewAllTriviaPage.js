import React, { useState, useEffect } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  paper: {
    padding: theme.spacing(2),
  },
  playButton: {
    margin: theme.spacing(1),
  },
}));

const TriviaItem = ({ trivia, handleJoinGame, handleJoinGameAsTeam,teamName, isTeamGame }) => {
  const classes = useStyles();


  const email = localStorage.getItem('email');


  return (
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className={classes.paper}>
          <Typography variant="h5">{trivia.triviaName}</Typography>
          <Typography>Category: {trivia.categoryName}</Typography>
          <Typography>Short Description: {trivia.shortDescription}</Typography>
          <Typography>Timeframe: {trivia.timeFrame}</Typography>
          <Typography>Difficulty Level: {trivia.difficultyLevel}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleJoinGame(trivia.triviaId, email)}
            className={classes.playButton}
          >
            Play as Individual
          </Button>
          {isTeamGame && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleJoinGameAsTeam(trivia.triviaId, teamName)}
              className={classes.playButton}
            >
              Play as Team
            </Button>
          )}
        </Paper>
      </Grid>
  );
};

const BrowseGames = () => {
  const classes = useStyles();
  const [triviaList, setTriviaList] = useState([]);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [difficultyList, setDifficultyList] = useState([]);
  const [timeFrameList, setTimeFrameList] = useState([]);
  const [isTeamGame, setIsTeamGame] = useState(null);
  const [teamDetailsFetched, setTeamDetailsFetched] = useState(false);
  const [teamName, setTeamName] = useState(null);
  const[teamDetails,setTeamDetails]=useState({});
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

        const data =  await response.json();
        setTeamDetails(data)
        setIsTeamGame(data.isPartOfTeam)
        setTeamName(data.teamName)
      } catch (error) {
        console.error(error);
        setTeamDetails({isPartOfTeam:true,
          teamName:"team1",
          IsTeamAdmin:localStorage.getItem('isAdmin')==="true",
          teamMembers:["newuser123@gmail.com","user2@gmail.com"]})
        // Handle the error here (e.g., display an error message)
      }


      setTeamDetailsFetched(true);

    };
    if(!teamDetailsFetched){
      fetchTeamDetails();
    }

  }, [teamDetailsFetched]);

  useEffect(() => {
    fetchTrivia();
  }, []);


  const fetchTrivia = async () => {
    try {
      const response = await axios.get("https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-getTrivia");
      const triviaData = response.data;
      const distinctCategories = [...new Set(triviaData.map((trivia) => trivia.categoryName))];
      const distinctDifficulty = [...new Set(triviaData.map((trivia) => trivia.difficultyLevel))];
      const distinctTimeFrame = [...new Set(triviaData.map((trivia) => trivia.timeFrame))];
      setCategoryList(distinctCategories);
      setDifficultyList(distinctDifficulty);
      setTimeFrameList(distinctTimeFrame);
      setTriviaList(triviaData);
  
      setTriviaList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilter = async () => {
    try {
      const response = await axios.get("https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-getTrivia", {
        params: {
          "filter[category]": category,
          "filter[difficulty]": difficulty,
          "filter[timeframe]": timeframe,
        },
      });
      setTriviaList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinGame = async (triviaId, email) => {
    try {
      const response = await axios.post(
        "https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-joinGame",
        {
          triviaId,
          emailId: email,
        }
      );
  
      // Handle the response or redirect to the active games page
      const { gameId, message } = response.data;
      if (gameId) {
        // Redirect to the /play page with the gameId parameter
        window.location.href = `/play?gameId=${gameId}`;
      } else {
        // Handle the error or show the message to the user
        console.log(message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleJoinGameAsTeam = async (triviaId, teamName) => {
    try {
      const response = await axios.post(
        "https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-joinGameAsTeam",
        {
          triviaId,
          teamName,
        }
      );
  
      // Handle the response or redirect to the active games page
      const { gameId, message } = response.data;
      if (gameId) {
        // Redirect to the /play page with the gameId parameter
        window.location.href = `/play?gameId=${gameId}`;
      } else {
        // Handle the error or show the message to the user
        console.log(message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (!teamDetailsFetched) {
    return <div>Loading...</div>;
  }

  return (

    <Container className={classes.root}>
      <Typography variant="h3" component="h1" align="center">
        Browse Games
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
        <FormControl className={classes.formControl}>
            <InputLabel>Category</InputLabel>
                 <Select value={category} onChange={(e) => setCategory(e.target.value)} >
                    <MenuItem value="">All</MenuItem>
                        {categoryList.map((category) => (
                        <MenuItem key={category} value={category}>
                        {category}
                    </MenuItem>
                ))}
                </Select>
        </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl className={classes.formControl}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
                    <MenuItem value="">All</MenuItem>
                        {difficultyList.map((difficulty) => (
                        <MenuItem key={difficulty} value={difficulty}>
                        {difficulty}
                    </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl className={classes.formControl}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
                        {timeFrameList.map((timeFrame) => (
                        <MenuItem key={timeFrame} value={timeFrame}>
                        {timeFrame}
                    </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Apply Filter
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} className={classes.root}>
        {triviaList.map((trivia) => (
          <TriviaItem key={trivia.triviaId} trivia={trivia} teamName={teamName} isTeamGame={isTeamGame} handleJoinGame={handleJoinGame} handleJoinGameAsTeam={handleJoinGameAsTeam}  />
        ))}
      </Grid>
    </Container>
  );
};

const ActiveGames = () => {
  const classes = useStyles();
  const [activeGames, setActiveGames] = useState([]);

  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    try {
      const response = await axios.get("https://us-central1-sdp17-392601.cloudfunctions.net/trivia-details-dev-activeGameDetails");
      setActiveGames(response.data.games);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h3" component="h1" align="center">
        Active Games
      </Typography>

      <Grid container spacing={2} className={classes.root}>
        {activeGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.gameId}>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="h5">Game ID: {game.gameId}</Typography>
              <Typography>Is Game Ended: {game.isGameEnded.toString()}</Typography>
              <Typography>Is Game Started: {game.isGameStarted.toString()}</Typography>
              <Typography>Participant Emails: {game.participantEmails.join(", ")}</Typography>
              <Typography>Time Remaining: {game.timeRemaining}</Typography>
              <Typography>Trivia:</Typography>
              <Typography>Category: {game.trivia.categoryName}</Typography>
              <Typography>Short Description: {game.trivia.shortDescription}</Typography>
              <Typography>Timeframe: {game.trivia.timeFrame}</Typography>
              <Typography>Difficulty Level: {game.trivia.difficultyLevel}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const ViewAllTriviaPage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <div>
      <Tabs value={currentTab} onChange={handleTabChange} centered>
        <Tab label="Browse Games" onClick={() => setCurrentTab(0)} />
        <Tab label="Active Games" onClick={() => setCurrentTab(1)} />
      </Tabs>

      {currentTab === 0 && <BrowseGames />}
      {currentTab === 1 && <ActiveGames />}
    </div>
  );
};

export default ViewAllTriviaPage;
