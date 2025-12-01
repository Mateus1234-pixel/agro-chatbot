// Environment variable validation for the Agrosense API
class EnvValidator {
    constructor() {
        this.requiredVars = {
            OPENAI_API_KEY: {
                required: true,
                description: 'OpenAI API key for agricultural recommendations',
                type: 'string',
                minLength: 40,
                pattern: /^sk-[a-zA-Z0-9]+$/
            },
            PORT: {
                required: false,
                default: 3000,
                description: 'Port for the server to run on',
                type: 'number',
                min: 1000,
                max: 65535
            },
            NODE_ENV: {
                required: false,
                default: 'development',
                description: 'Node.js environment',
                type: 'string',
                allowed: ['development', 'production', 'test']
            },
            MONGODB_URI: {
                required: false,
                description: 'MongoDB connection string',
                type: 'string',
                pattern: /^mongodb(\+srv)?:\/\//
            }
        };

        this.validatedVars = {};
    }

    validate() {
        const missingVars = [];
        const invalidVars = [];

        for (const [key, config] of Object.entries(this.requiredVars)) {
            const value = process.env[key];

            // Handle missing required variables
            if (config.required && !value) {
                if (config.default !== undefined) {
                    process.env[key] = config.default;
                    this.validatedVars[key] = config.default;
                    continue;
                }
                missingVars.push(key);
                continue;
            }

            // Validate type
            if (value && config.type === 'number') {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    invalidVars.push({ key, reason: `Must be a number, got: ${value}` });
                    continue;
                }
                process.env[key] = numValue;
                this.validatedVars[key] = numValue;
            } else {
                this.validatedVars[key] = value;
            }

            // Validate min/max for numbers
            if (config.type === 'number' && value) {
                const numValue = Number(value);
                if (config.min !== undefined && numValue < config.min) {
                    invalidVars.push({ key, reason: `Must be at least ${config.min}, got: ${numValue}` });
                }
                if (config.max !== undefined && numValue > config.max) {
                    invalidVars.push({ key, reason: `Must be at most ${config.max}, got: ${numValue}` });
                }
            }

            // Validate string patterns
            if (config.type === 'string' && value && config.pattern) {
                if (!config.pattern.test(value)) {
                    invalidVars.push({ key, reason: `Invalid format for ${key}` });
                }
            }

            // Validate allowed values
            if (config.type === 'string' && value && config.allowed) {
                if (!config.allowed.includes(value)) {
                    invalidVars.push({ 
                        key, 
                        reason: `Must be one of: ${config.allowed.join(', ')}, got: ${value}` 
                    });
                }
            }

            // Validate min length for strings
            if (config.type === 'string' && value && config.minLength) {
                if (value.length < config.minLength) {
                    invalidVars.push({ 
                        key, 
                        reason: `Must be at least ${config.minLength} characters long` 
                    });
                }
            }
        }

        // Throw errors for missing or invalid variables
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        if (invalidVars.length > 0) {
            const errorMessages = invalidVars.map(({ key, reason }) => `${key}: ${reason}`);
            throw new Error(`Invalid environment variables:\n${errorMessages.join('\n')}`);
        }

        return this.validatedVars;
    }

    getValidatedVars() {
        return this.validatedVars;
    }

    // Health check for environment variables
    healthCheck() {
        try {
            this.validate();
            return {
                status: 'healthy',
                message: 'All environment variables are properly configured',
                variables: this.validatedVars
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: error.message,
                variables: this.validatedVars
            };
        }
    }

    // Generate .env.example file content
    generateEnvExample() {
        const lines = ['# Agrosense Environment Variables', ''];
        
        for (const [key, config] of Object.entries(this.requiredVars)) {
            lines.push(`# ${config.description}`);
            if (config.required) {
                lines.push(`${key}=`);
            } else {
                lines.push(`# ${key}=${config.default}`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }
}

// Singleton instance
const envValidator = new EnvValidator();

// Export for use in server.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = envValidator;
}

// Export for browser (if needed)
if (typeof window !== 'undefined') {
    window.EnvValidator = EnvValidator;
}
