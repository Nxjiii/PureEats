import React, { useState, useRef } from 'react';
import { View, TextInput, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const ChatbotScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [botTypingMessage, setBotTypingMessage] = useState(''); // For typing effect
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (message.trim()) {
      // Add the user's message to the chat history
      setChatHistory([...chatHistory, { user: message }]);
      setMessage(''); // Clear the message input field
  
      // TEMPORARY: Hardcoded bot response for testing
      // This block should be removed once the actual logic (e.g., API integration) is ready
      setBotTypingMessage('');
      setTimeout(() => {
        simulateTypingEffect(" this is a hardcoded bot response."); // Example bot response
      }, 500);
      // END OF TEMPORARY BLOCK
  
      // Actual logic for sending message to the API (commented out for now)
      /*
      try {
        const response = await fetch('https://pureeats.onrender.com/webhooks/rest/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: 'user',
            message: message,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data && data.length > 0) {
          simulateTypingEffect(data[0].text);
        }
      } catch (error) {
        console.error('Error sending message to Rasa:', error);
        simulateTypingEffect('Sorry, there was an error. Please try again.');
      }
      */
    }
  };

  const simulateTypingEffect = (fullMessage) => {
    setBotTypingMessage(''); // Reset the bot message
    let index = 0;
    const chunkSize = 5; // Adjust the size of each chunk here
  
    const typingInterval = setInterval(() => {
      if (index < fullMessage.length) {
        // Get the current chunk of the message
        const currentChunk = fullMessage.slice(index, index + chunkSize);
        setBotTypingMessage((prev) => prev + currentChunk);
        index += chunkSize; // Move to the next chunk
      } else {
        clearInterval(typingInterval);
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          { bot: fullMessage },
        ]);
        setBotTypingMessage(''); // Clear the typing effect message
      }
    }, 100); // Adjust speed here (100ms per chunk)
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>

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

          {/* Display the typing effect */}
          {botTypingMessage !== '' && (
            <View style={[styles.chatBubble, styles.botBubble]}>
              <Text style={styles.chatText}>{botTypingMessage}</Text>
            </View>
          )}
        </ScrollView>

        {chatHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>Clear Chat</Text>
          </TouchableOpacity>
        )}                           
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          returnKeyType="send"            
          onSubmitEditing={sendMessage}
        />
        {/* Removed Icon and replaced with a simple Text button */}
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    color: '#BB86FC',
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  chatWindow: {
    flex: 1,
    paddingVertical: 10,
  },
  chatBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#BB86FC',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#1E1E1E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  chatText: {
    fontSize: 12,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  textInput: {
    flex: 1,
    borderWidth: 0,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#1E1E1E',
    color: '#fff',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    padding: 12,
    backgroundColor: '#BB86FC',
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#FF4D4D',
    borderRadius: 20,
    marginVertical: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
