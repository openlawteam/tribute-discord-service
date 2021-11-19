import {createHttpTerminator} from 'http-terminator';
import {envCheck} from './helpers';
import {httpServer} from './http-api';
import {startWebhookTasks} from './webhook-tasks';

async function main() {
  try {
    // Check if all environment variables are set
    envCheck();

    // Start listening for events and take actions
    const runners = await startWebhookTasks();

    // Start the HTTP server
    const server = httpServer();

    // App's graceful shutdown handler
    const gracefulShutdown = async (signal: NodeJS.Signals) => {
      console.log(`☠️  Received signal to terminate: ${signal}`);

      // Handles properly closing any processes started by runners
      await Promise.allSettled(runners.map(({stop}) => stop?.()));

      // Handle shutting down the `server`
      await createHttpTerminator({
        // 15 second timeout
        gracefulTerminationTimeout: 15000,
        server,
      }).terminate();

      console.log('Successfully terminated HTTP server.');

      process.exit();
    };

    // Handle a graceful exit
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGQUIT', gracefulShutdown);
  } catch (error) {
    console.error(`An error occurred while starting the app: ${error}`);
  }
}

// Start the app
main();
