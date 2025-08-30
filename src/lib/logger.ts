const isServer = typeof window === 'undefined';

// Simple client-safe logger
export const logger = {
  log: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    
    if (isServer) {
      // console.log(logMessage); // Removed for production
    } else {
      // Client-side: just use console
      // console.log(logMessage); // Removed for production
    }
  },
  error: (message: string, error?: unknown) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ERROR: ${message}`;
    
    if (error) {
      const errorMessage = error instanceof Error ? error.stack : JSON.stringify(error);
      logMessage += ` - ${errorMessage}`;
    }
    
    if (isServer) {
      console.error(logMessage);
    } else {
      console.error(logMessage);
    }
  },
  clear: () => {
    // No-op for client-side compatibility
    // console.log('Logger cleared'); // Removed for production
  }
};

export default logger;
