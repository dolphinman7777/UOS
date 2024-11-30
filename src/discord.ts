import { DiscordClient } from '@ai16z/client-discord';
import { IAgentRuntime } from '@ai16z/eliza';
import { config } from 'dotenv';

config();

export async function startDiscordBot(runtime: IAgentRuntime) {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        throw new Error('DISCORD_BOT_TOKEN is not set in environment variables');
    }

    const client = new DiscordClient({
        token,
        runtime,
        // Discord intents are now handled internally by the client
    });

    try {
        await client.start();
        console.log('Discord bot is now online!');
        
        // Event handlers are now handled internally by the client
        
    } catch (error) {
        console.error('Failed to start Discord bot:', error);
        throw error;
    }
    
    return client;
} 