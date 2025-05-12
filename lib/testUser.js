import { supabase } from './supabaseClient.js';

const testSignup = async () => {
  const response = await supabase.auth.signUp({
    email: "Najibasm178@gmail.com",
    password: "password123",
  });

  console.log("Supabase signup response:", response);

  if (response.error) {
    console.error('Signup error:', response.error);
  } else {
    console.log('User created:', response.data.user);  // Access user from response.data
  }
};

testSignup();   //testUser.js