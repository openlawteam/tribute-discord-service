import {envCheck} from './helpers';
import {httpServer} from './http-api';
import {startWebhookTasks} from './webhook-tasks';

// Check if all environment variables are set
envCheck();

// Start listening for events and take actions
startWebhookTasks();

// Start the HTTP server
httpServer();
