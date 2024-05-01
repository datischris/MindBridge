import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, StyleSheet, Text, View, useColorScheme, FlatList } from 'react-native';
import theme from './utils/theme';
import { Header } from '@rneui/base';
import RobotAnimation from './assets/robotIdle.json';
import LottieView from 'lottie-react-native';

export default function App() {
  const scheme = useColorScheme();
  const color = theme(scheme);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  const callChatbotAPI = async (message) => {
    const response = await fetch('http://127.0.0.1:8080/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  };

  const sendMessage = async () => {
    const newMessage = { text: input, sender: 'user' };
    const thinkingMessage = { text: 'Thinking of the perfect response...', sender: 'bot' };

    setMessages(prevMessages => [...prevMessages, newMessage, thinkingMessage]);
    setInput('');

    try {
      const data = await callChatbotAPI(input);
      setMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1);
        newMessages.push({ text: data.response, sender: 'bot' });
        return newMessages;
      });
    } catch (error) {
      console.error("There was an error sending the message: ", error);
      setMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1);
        newMessages.push({ text: "Error: Could not get a response from the chatbot.", sender: 'bot' });
        return newMessages;
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, { flexDirection: 'row', alignItems: 'center' }]}>
      {item.sender === 'bot' && (
        <View style={{ marginRight: 10 }}>
          <LottieView
            source={RobotAnimation}
            autoPlay
            loop
            style={{ width: 50, height: 50 }}
          />
        </View>
      )}
      <View style={[styles.messageBubble, { backgroundColor: item.sender === 'user' ? '#2E8BC0' : '#323233' }]}>
      <Text style={{ color: item.sender === 'user' ? (scheme === 'light' ? color.buttonText : color.text) : (scheme === 'light' ? color.buttonText : color.text) }}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style = {{marginTop: "15%"}}>
      <Header
        backgroundColor={color.background}
        centerComponent={{ text: 'Mental Health Chatbot', style: { color: color.text, fontWeight: 'bold' } }}
        containerStyle={{ borderBottomColor: 'transparent' }}
      />
      </View>
      {messages.length === 0 && (
        <><View style = {{ width: "95%", marginVertical: "10%", justifyContent: "center", alignItems: "center"}}>
          <Text style = {{textAlign: "center", fontWeight: "300", fontSize: 14, color: "gray"}}>
            Conversations are confidential and never stored/shared.
          </Text>
        </View><LottieView
            source={RobotAnimation}
            autoPlay
            loop
            style={{ width: '100%', height: 200, marginTop: '15%' }} /></>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[styles.messagesContainer]}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor: color.placeholderTextColor, color: color.text }]}
          onChangeText={setInput}
          value={input}
          placeholder="Type your message"
          placeholderTextColor="gray"
          multiline={true}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    paddingTop: 10,
    paddingVertical: 10,
    paddingLeft: 10,
    marginRight: 10,
    borderRadius: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 30,
  },
});
