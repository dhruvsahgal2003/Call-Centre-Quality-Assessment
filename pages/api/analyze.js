import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not set');
      }

      const { audio } = req.body;

      if (!audio) {
        throw new Error('No audio data provided');
      }

      // Create a temporary file
      const tempFilePath = path.join(os.tmpdir(), 'temp_audio.mp3');
      fs.writeFileSync(tempFilePath, Buffer.from(audio, 'base64'));

      // 1. Speech-to-text conversion
      const transcription = await speechToText(tempFilePath);

      // Remove the temporary file
      fs.unlinkSync(tempFilePath);

      // 2. Sentiment analysis
      const sentiment = await analyzeSentiment(transcription);

      // 3. QA report generation
      const report = await generateQAReport(transcription);

      res.status(200).json({
        transcript: transcription,
        analysis: sentiment,
        report: report,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function speechToText(filePath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });
  return transcription.text;
}

async function analyzeSentiment(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a sentiment analysis expert. Analyze the following text and provide sentiment for the agent and customer, as well as the overall tone. Please format your response as follows:\nAgent Sentiment: [Positive/Negative/Neutral]\nCustomer Sentiment: [Positive/Negative/Neutral]\nOverall Tone: [Professional/Friendly/Hostile/etc.]" },
      { role: "user", content: text },
    ],
  });
  
  const content = response.choices[0].message.content;
  const lines = content.split('\n');
  const sentiment = {};

  lines.forEach(line => {
    const [key, value] = line.split(': ');
    if (key && value) {
      sentiment[key.trim()] = value.trim();
    }
  });

  return {
    agentSentiment: sentiment['Agent Sentiment'] || 'Unknown',
    customerSentiment: sentiment['Customer Sentiment'] || 'Unknown',
    overallTone: sentiment['Overall Tone'] || 'Unknown',
  };
}

async function generateQAReport(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a quality assurance expert for call centers. Generate a brief QA report based on the following call transcript, including suggestions for improvement." },
      { role: "user", content: text },
    ],
  });
  
  return response.choices[0].message.content;
}