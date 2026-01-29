// src/api/client.js
import axios from 'axios';

const client = axios.create({
  // FIX: Ensure this is HTTPS, not HTTP
  baseURL: 'https://ecchatbot-uat.engro.com', 
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export default client;