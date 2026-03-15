/**
 * Helper utility to retry database operations in serverless environments
 * specifically to handle cold start timeouts and transient connection hiccups.
 */
const withRetry = async (fn, maxAttempts = 3, delay = 500) => {
    let lastError;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            // Immediate failures for client errors that won't resolve with a retry
            if (
                err.name === 'CastError' || 
                err.name === 'ValidationError' ||
                (err.status && err.status >= 400 && err.status < 500)
            ) {
                throw err;
            }
            
            console.warn(`⚠️ DB Operation failed (attempt ${i + 1}/${maxAttempts}): ${err.message}`);
            
            if (i < maxAttempts - 1) {
                // Exponential backoff or simple delay
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
    throw lastError;
};

module.exports = { withRetry };
