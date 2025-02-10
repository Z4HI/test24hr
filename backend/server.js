import express from "express";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai"
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const OpenAIApi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const client = new TextToSpeechClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

app.post("/generate-tts", async (req, res) => {
   
    const { text } = req.body;
    const fileName = `output${Date.now()}.mp3`
    const filePath = path.join(__dirname, fileName);
    // Google TTS API request
    const request = {
        input: { text },
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3",speakingRate: 0.8 },
    };
    try {
        const [response] = await client.synthesizeSpeech(request);
        fs.writeFileSync(filePath, response.audioContent) ;
        const audioUrl = `http://localhost:5000/${fileName}`
        res.json({AudioUrl : audioUrl})
    } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    
});

app.delete("/DeleteAudioUrl", async (req,res)=>{
    const url = req.body.filePath
    if (fs.existsSync(url)){
        fs.unlinkSync(url)
        console.log('audio deleted');
    } 
})
app.post("/GenerateOptions", async (req, res) => {
 
    const prompt = `Here is the latest chapter of the story:
    ${req.body.story}
    What happens next? Provide 3 different options, each being one sentence long, describing possible directions the story could take. 
    Always Format them like this:
      Always Format them like this:
    1. 
    2. 
    3.`;

    const response = await OpenAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: "system", content: "You are a creative storyteller." },
            { role: "user", content: prompt }],
        temperature: 0.8, // Adjust creativity
        max_tokens: 300,
    });
    const responseText = response.choices[0].message.content.trim()
    res.send(responseText);
})

app.post("/GenerateNextChapter", async (req, res) => {
    const prompt = `Here is the latest chapter of the story:
    ${req.body.currentStory}
    the choice was ${req.body.choice}
    repeat the choice to me
    `;

    const response = await OpenAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: "system", content: "You are a creative storyteller." },
            { role: "user", content: prompt }],
        temperature: 0.8, // Adjust creativity
        max_tokens: 10,
    });
    const responseText = response.choices[0].message.content.trim()
    res.send(responseText);
    
})

app.get('/', (req,res)=>{
    res.send('hello')
})

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});