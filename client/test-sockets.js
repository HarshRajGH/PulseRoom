import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

async function run() {
  try {
    // 1. Login admin
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@syncwave.app',
      password: 'password123'
    });
    const adminToken = adminRes.data.data.accessToken;
    const adminId = adminRes.data.data.user._id;

    // 2. Login priya
    const priyaRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'priya@syncwave.app',
      password: 'password123'
    });
    const priyaToken = priyaRes.data.data.accessToken;
    const priyaId = priyaRes.data.data.user._id;

    // 3. Connect sockets
    const adminSocket = io(SOCKET_URL, { auth: { token: adminToken } });
    const priyaSocket = io(SOCKET_URL, { auth: { token: priyaToken } });

    await new Promise((resolve) => {
        let connectedCount = 0;
        adminSocket.on('connect', () => { connectedCount++; if(connectedCount === 2) resolve(); });
        priyaSocket.on('connect', () => { connectedCount++; if(connectedCount === 2) resolve(); });
    });
    console.log('Both sockets connected.');

    // 4. Test DM
    console.log('Testing DM from Admin to Priya...');
    const dmReceived = new Promise((resolve) => {
        priyaSocket.on('dm:message', (data) => {
            console.log('Priya received DM:', data.content);
            resolve(data);
        });
    });

    // Fetch conversation first
    const convRes = await axios.post(`${API_URL}/conversations`, {
      userId: priyaId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const conversationId = convRes.data.data._id;

    adminSocket.emit('dm:message', {
        conversationId,
        text: 'Hello Priya, this is a real-time test!',
    });

    await dmReceived;
    console.log('DM Test Passed!');
    
    // 5. Test Room Join and chat
    console.log('Testing Room sync...');
    // create room
    const roomRes = await axios.post(`${API_URL}/rooms`, {
      name: 'Test Room',
      description: 'A test room',
      privacy: 'public'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const roomId = roomRes.data.data._id;
    console.log('Room created:', roomId);

    // both join
    adminSocket.emit('join-room', { roomId });
    priyaSocket.emit('join-room', { roomId });

    const roomChatReceived = new Promise((resolve) => {
        priyaSocket.on('chat:message', (msg) => {
             console.log('Priya received Room Chat:', msg.text);
             resolve(msg);
        });
    });
    
    // wait a moment for joins to process
    await new Promise(r => setTimeout(r, 500));
    adminSocket.emit('chat:message', { roomId, text: 'Welcome to the room' });
    
    await roomChatReceived;
    console.log('Room Chat Test Passed!');

    adminSocket.disconnect();
    priyaSocket.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
