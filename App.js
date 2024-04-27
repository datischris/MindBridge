import { useState, useRef, useEffect } from 'react';
import { TextInput, Button, StyleSheet, Text, View, useColorScheme, KeyboardAvoidingView, Platform, FlatList} from 'react-native';
import theme from './utils/theme';

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
    try {
      const data = await callChatbotAPI(input);
      const newMessage = { text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInput('');
      scrollToBottom();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("There was an error sending the message: ", error);
      const errorMessage = { text: "Error: Could not get a response from the chatbot.", sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setInput('');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, { alignItems: item.sender === 'user' ? 'flex-end' : 'flex-start' }]}>
      <View style={[styles.messageBubble, { backgroundColor: item.sender === 'user' ? '#2E8BC0' : '#323233' }]}>
        <Text style={{ color: item.sender === 'user' ? 'white' : 'black' }}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={scrollToBottom}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor: color.placeholderTextColor, color: color.text }]}
          onChangeText={setInput}
          value={input}
          placeholder="Type your message"
          placeholderTextColor="gray"
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
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
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
