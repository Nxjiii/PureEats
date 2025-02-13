import React, { useState, useRef } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const ChatbotScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const scrollViewRef = useRef();

  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { user: message }]);
      setMessage('');

      // Simulate bot response 
      setTimeout(() => {
        setChatHistory(prevChatHistory => [
          ...prevChatHistory,
          { bot: 'This is a bot reply!' }, // Placeholder response
        ]);
      }, 1000); // processing effect 1 sec
    }
  };


  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Container */}
      <View style={styles.chatContainer}>
        <ScrollView 
          style={styles.chatWindow} 
          ref={scrollViewRef} 
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {chatHistory.map((entry, index) => (
            <View key={index} style={[styles.chatBubble, entry.user ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.chatText}>{entry.user || entry.bot}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Clear chat, temporary use only*/}
        {chatHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>Clear Chat</Text>
          </TouchableOpacity>
        )}                           
      </View>

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          returnKeyType="send"            
          onSubmitEditing={sendMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3837',
  },
  chatContainer: {
    flex: 1,
    marginTop: 40, 
    marginBottom: 0, 
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)' ,
  },
  chatWindow: {
    flex: 1,
    padding: 10,
  },
  chatBubble: {
    marginBottom: 10,
    padding: 5,
    borderRadius: 12,
    maxWidth: '70%',
    opacity: '0.7',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',  // Light green for user
    alignSelf: 'flex-end',  // User messages align to the right
  },
  botBubble: {
    backgroundColor: '#fff',  // White for bot
    alignSelf: 'flex-start',  // Bot messages align to the left
  },
  chatText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#b5b5b5',
  },

  //clear chat, temporary use only
  clearButton: {
    alignSelf: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FF4D4D',  
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
