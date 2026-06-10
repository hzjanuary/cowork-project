import { Ollama } from 'ollama';
import 'dotenv/config';

const ollamaCfg = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

export default ollamaCfg;
