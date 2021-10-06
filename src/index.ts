import {envCheck} from './helpers';
import {httpServer} from './http-api';
import {start} from './start';

// Check if all environment variables are set
envCheck();

// Start listening for events
start();

// Start the HTTP server
httpServer();
