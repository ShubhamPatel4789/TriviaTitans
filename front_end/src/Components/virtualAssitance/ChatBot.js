import React, { useState, useEffect, useRef } from 'react';
import { TextField, Card, Typography, Container, Box, Button, createTheme, ThemeProvider, Grid, CardContent, CardHeader } from '@mui/material';
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import { v4 as uuidv4 } from 'uuid';
import styled from "@emotion/styled";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Refered From
// "AWS SDK for JavaScript," Amazon Web Services, Inc., 2023. [Online]. Available: https://aws.amazon.com/sdk-for-javascript/. [Accessed: 29- Jul- 2023].
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const theme = createTheme({
  palette: {
    primary: {
      main: '#008080', 
    },
    secondary: {
      main: '#708090', // Slate Gray color
    },
    background: {
      default: '#1e1e1e', // Dark background
    },
    text: {
      primary: '#ffffff', // Dark text
      secondary: '#000000', // Black text
    },
  },
  typography: {
    fontSize: 16,
    fontFamily: 'Arial',
    h5: {
      fontWeight: 600,
    },
  },
});



const client = new LexRuntimeV2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
  }
});

const ChatBox = styled.div`
  height: 50vh; // Increase the height to 50% of viewport height
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5; // Light Grey color
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2); // Shadow for 3D effect
`;


const ChatBot = () => {
  // This state hook is used to store the current message that the user types into the chat box.
  const [message, setMessage] = useState('');
  // This state hook is used to store the entire conversation between the user and the bot.
  const [conversation, setConversation] = useState([]);
  const [sessionId, setSessionId] = useState(uuidv4());

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const initialMessage = 'Hi There! How can I help you today?';
    setConversation([{ message: initialMessage, from: 'bot' }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  // This function is called when the user submits a message.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit function triggered'); //logs

    const params = {
      botId: '7DAER9DILV', 
      botAliasId: 'TSTALIASID',
      localeId: 'en_US',
      sessionId: sessionId,
      text: message,
    };
    const command = new RecognizeTextCommand(params);
    client.send(command, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        let botMessage = "Apologies for the confusion, I didn't quite grasp that. Could you kindly express it differently?";
        console.log(data);
        if (data.messages && data.messages.length > 0) {
            botMessage = data.messages.map(msg => msg.content).join(" ");
        }

        setConversation([...conversation, { message, from: 'user' }, { message: botMessage, from: 'bot' }]);
        setMessage('');
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', height: '100vh', backgroundColor: 'background.default', color: 'text.primary' }}>
        <Container maxWidth="sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Card variant="outlined" style={{ backgroundColor: '#fafafa', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', marginBottom: '20px', width: '100%' }}>
            <CardHeader title="TRIVIA BOT" titleTypographyProps={{align:"center", variant:"h6", color: 'textPrimary'}} style={{ backgroundColor: theme.palette.primary.main }}/>
            <ChatBox>
              {conversation.map((convo, index) => (
                <Box
                  key={index}
                  alignSelf={convo.from === 'bot' ? 'flex-start' : 'flex-end'}
                  bgcolor={convo.from === 'bot' ? 'primary.main' : 'secondary.main'}
                  m={1}
                  p={1}
                  borderRadius={2}
                  maxWidth="80%"
                  style={{ animation: 'fade-in 0.3s' }}
                >
                  <Typography variant="body1" style={{ color: 'text.secondary' }}>{convo.message}</Typography>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </ChatBox>
            <CardContent>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Grid container spacing={1}>
                  <Grid item xs={9}>
                    <TextField
                      id="standard-basic"
                      label="Type your message"
                      variant="standard"
                      value={message}
                      onChange={handleChange}
                      fullWidth
                      color="secondary"
                      InputProps={{ style: { color: '#000' } }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button variant="contained" color="primary" type="submit" fullWidth onClick={() => console.log('Button clicked')}>Send</Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChatBot;