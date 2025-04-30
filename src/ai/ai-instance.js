import { OpenAI } from "langchain/llms/openai";

class AiInstance {
  constructor(config) {
    this.model = new OpenAI({
      openAIApiKey: config.openAIApiKey,
      temperature: config.temperature || 0.9,
    });
  }

  getModel() {
    return this.model;
  }
}

export default AiInstance;