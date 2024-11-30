import { Client, GatewayIntentBits, Partials, Message } from 'discord.js';
import { IAgentRuntime, generateMessageResponse, Content } from '@ai16z/eliza';
import { config } from 'dotenv';

config();

interface DiscordClientConfig {
    token: string;
    runtime: IAgentRuntime;
}

export class DiscordClient extends Client {
    private runtime: IAgentRuntime;

    constructor(config: DiscordClientConfig) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User]
        });

        this.runtime = config.runtime;
        
        // Initialize message handling immediately
        this.on('messageCreate', async (message: Message) => {
            try {
                // Ignore bot messages
                if (message.author.bot) return;
                
                console.log('Message received:', message.content);
                
                // Check for mentions using content
                if (message.mentions.users.has(this.user!.id)) {
                    console.log('Bot was mentioned, sending immediate response...');
                    
                    // Send immediate response first
                    await message.reply('Hello! I received your message.');
                    
                    // Then try to generate AI response
                    try {
                        // Simple fixed response for testing
                        const simpleResponse = {
                            text: "I'm a simple test response to verify the bot is working."
                        };
                        
                        await message.reply(simpleResponse.text);
                        
                        // Only after simple response works, try AI generation
                        const aiResponse = await generateMessageResponse({
                            runtime: this.runtime,
                            context: message.content,
                            modelClass: 'gpt-4'
                        });
                        
                        if (aiResponse && typeof aiResponse === 'object' && 'text' in aiResponse) {
                            await message.reply(`AI Response: ${aiResponse.text}`);
                        }
                    } catch (genError) {
                        console.error('Generation error:', genError);
                        await message.reply('Had trouble with the AI response, but I am here!');
                    }
                }
            } catch (error) {
                console.error('Message handling error:', error);
                try {
                    await message.reply('Error occurred, but I am still running!');
                } catch (replyError) {
                    console.error('Could not send error message:', replyError);
                }
            }
        });
    }

    async start(): Promise<void> {
        try {
            await this.login(process.env.DISCORD_BOT_TOKEN);
            console.log('Discord client started and ready to respond!');
        } catch (error) {
            console.error('Failed to start Discord client:', error);
            throw error;
        }
    }
}

export async function startDiscordBot(runtime: IAgentRuntime) {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        throw new Error('DISCORD_BOT_TOKEN is not set in environment variables');
    }

    const client = new DiscordClient({
        token,
        runtime
    });

    try {
        await client.start();
        
        client.once('ready', () => {
            console.log(`Logged in as ${client.user?.tag}!`);
        });
        
    } catch (error) {
        console.error('Failed to start Discord bot:', error);
        throw error;
    }
    
    return client;
} 