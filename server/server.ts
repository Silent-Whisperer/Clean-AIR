import { app } from './index';
import { config, validateConfig } from './config';

validateConfig();

app.listen(config.port, () => {
  console.log(`[ClearAir Server] Listening on port http://localhost:${config.port}`);
  console.log(`[ClearAir Server] Environment: ${config.nodeEnv}`);
  console.log(`[ClearAir Server] GenAI API Integration: ${config.geminiApiKey ? 'Enabled (Gemini API)' : 'Non-AI Fallback Engine Active'}`);
});
