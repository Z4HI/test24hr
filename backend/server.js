import express from "express";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import http from "http";
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "1mb" }));
const OpenAIApi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = new TextToSpeechClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
const server = http.createServer((req, res) => {
  res.writeHead(200, { Connection: "keep-alive" });
  res.end("Hello, keep-alive enabled!\n");
});
//Google TTS
app.post("/generate-tts", async (req, res) => {
  const { text } = req.body;
  const fileName = `output${Date.now()}.mp3`;
  const filePath = path.join(__dirname, "/audio", fileName);
  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 0.8 },
  };
  try {
    const [response] = await client.synthesizeSpeech(request);
    fs.writeFileSync(filePath, response.audioContent);
    const audioUrl = `http://localhost:5000/audio/${fileName}`;
    res.json({ AudioUrl: audioUrl });
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Delete AUDIO
app.delete("/DeleteAudioUrl", async (req, res) => {
  const url = req.body.filePath;
  const filePath = path.join(__dirname, "/audio", url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.status(200).send("deleted succesfully");
});
//Generate Story Options
app.post("/GenerateOptions", async (req, res) => {
  const prompt = `Here is the latest chapter of the story:
    ${req.body.story}
    What happens next? Provide 4 different options, each being one sentence long, describing possible directions the story could take. 
    the 4th option should always be the choice to "end the story"
    Always Format them like this:
      Always Format them like this:
    1. 
    2. 
    3.
    4.End of the story`;
  const response = await OpenAIApi.chat.completions.create(
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a creative storyteller." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8, // Adjust creativity
      max_tokens: 100,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Authorization with API key
        "Content-Type": "application/json", // Ensure content type is JSON
      },
    }
  );
  const responseText = response.choices[0].message.content.trim();
  res.send(responseText);
});
let count = 0;
//GenerateNextChapter
app.post("/GenerateNextChapter", async (req, res) => {
  count += 1;
  console.log(count);
  const prompt = `Here is the latest chapter of the story:
    ${req.body.CurrentStory}.
    The next part of the story is about :${req.body.UserChoice}.
    If the latest part of the story is "End of the story" then provide a 
    happy ending to the story,and make sure the story ends with happily every after.
    Or else Generate what happens next..Do not add a title or chapter.
    
    `;
  const response = await OpenAIApi.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a creative storyteller." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8, // Adjust creativity
    max_tokens: 5,
  });
  const responseText = response.choices[0].message.content.trim();
  res.send(responseText);
});

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});
