import { AgentRuntime, ModelProviderName, CacheManager, MemoryCacheAdapter } from '@ai16z/eliza';
import { DiscordClient } from './discord.ts';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { SqliteDatabaseAdapter } from '@ai16z/adapter-sqlite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function main() {
    // Initialize SQLite database
    const db = new Database(':memory:');
    const databaseAdapter = new SqliteDatabaseAdapter(db);
    await databaseAdapter.init();

    // Initialize cache manager with memory adapter
    const cacheAdapter = new MemoryCacheAdapter();
    const cacheManager = new CacheManager(cacheAdapter);

    // Load character configuration
    const characterConfigPath = path.join(__dirname, '../../eliza.json');
    const character = JSON.parse(fs.readFileSync(characterConfigPath, 'utf-8'));

    // Initialize runtime with character configuration
    const runtime = new AgentRuntime({
        character,
        modelProvider: ModelProviderName.OPENAI,
        token: process.env.OPENAI_API_KEY,
        databaseAdapter,
        cacheManager
    });

    await runtime.initialize();

    // Initialize and start Discord client
    const discordClient = new DiscordClient(runtime);
    await discordClient.start(process.env.DISCORD_BOT_TOKEN);
}

main().catch(console.error);
