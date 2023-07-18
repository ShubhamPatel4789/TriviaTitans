import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
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

const ChatComponent = () => {
  const classes = useStyles();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const emailId = localStorage.getItem('email');

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

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
    setMessages((prevMessages) => [...prevMessages, {"email":emailId,"message":message}]);
  };

  useEffect(() => {
    const teamName = localStorage.getItem('teamName');
    const emailId = localStorage.getItem('email');

    const socketConnection = new WebSocket(
      'wss://3p2u6ghz7j.execute-api.us-east-2.amazonaws.com/production?teamName=' +
        teamName +
        '&emailId=' +
        emailId
    );

    socketConnection.onopen = () => {
      setSocket(socketConnection);
    };

    socketConnection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      if (socketConnection) {
        socketConnection.close();
      }
    };
  }, []);

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
};

export default ChatComponent;
