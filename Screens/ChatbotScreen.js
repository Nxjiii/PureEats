import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {supabase} from '../lib/supabaseClient';

const ChatbotScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [botTypingMessage, setBotTypingMessage] = useState('');
  const [username, setUsername] = useState('');
  const [supabaseToken, setSupabaseToken] = useState('');
  const scrollViewRef = useRef();

  //--------------------- Fetch session and username on mount---------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: {session},
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        setSupabaseToken(session.access_token); // Save token

        const {data: profile} = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        setUsername(profile?.username || 'User');
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchUserData();
  }, []);

  // -------------------------------Handle message sending-------------------------------------------
  const sendMessage = async () => {
    if (!message.trim()) return;

    // space between numbers and letters so model can understand
    let cleanedMessage = message.replace(/(\d)([a-zA-Z])/g, '$1 $2');

    const userMessage = cleanedMessage;
    setChatHistory(prev => [...prev, {user: userMessage}]);
    setMessage('');

    const metadata = {
      username,
      supabase_token: supabaseToken,
    };

    console.log('Sending metadata:', {username});

    try {
      setBotTypingMessage('Typing...');

      const response = await fetch(
        'http://localhost:5005/webhooks/rest/webhook',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            sender: username,
            message: userMessage,
            metadata, // Send both username + token
          }),
        },
      );

      const botResponses = await response.json();
      botResponses.forEach(msg => msg.text && simulateTypingEffect(msg.text));
    } catch (error) {
      simulateTypingEffect('⚠️ Connection error');
      console.error('API Error:', error);
    }
  };

  //-------------------------------- Simulate typing effect-------------------------------
  const simulateTypingEffect = fullMessage => {
    setBotTypingMessage('');
    let index = 0;
    const chunkSize = 5;

    const typingInterval = setInterval(() => {
      if (index < fullMessage.length) {
        const currentChunk = fullMessage.slice(index, index + chunkSize);
        setBotTypingMessage(prev => prev + currentChunk);
        index += chunkSize;
      } else {
        clearInterval(typingInterval);
        setChatHistory(prevChatHistory => [
          ...prevChatHistory,
          {bot: fullMessage},
        ]);
        setBotTypingMessage('');
      }
    }, 100);
  };

  // Clear chat history
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
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({animated: true})
          }>
          {chatHistory.map((entry, index) => (
            <View
              key={index}
              style={[
                styles.chatBubble,
                entry.user ? styles.userBubble : styles.botBubble,
              ]}>
              <Text style={styles.chatText}>{entry.user || entry.bot}</Text>
            </View>
          ))}

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
