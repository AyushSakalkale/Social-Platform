import io from 'socket.io-client';

// In production (Kubernetes), use the current origin
// In development, use localhost:4000
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // In production, use the current origin
  : 'http://localhost:4000';

console.log('Socket URL:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: false, // Changed to false to manually control connection
  withCredentials: true,
});

export const alertSocket = io(`${SOCKET_URL}/alert`, {
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: false, // Changed to false to manually control connection
  withCredentials: true,
}); 