import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const prompt = `Generate a JSON array of exactly 50 Islamic Duas in Bengali (Hisnul Muslim).
The schema should be:
[ { "id": "1", "title": "দোয়ার বাংলা শিরোনাম", "category": "ক্যাটাগরি", "arabic": "আরবি", "pronunciation": "উচ্চারণ", "translation": "অর্থ", "reference": "রেফারেন্স" } ]
Make sure to include basic daily duas, morning evening, prayer, sleeping, eating, traveling, sneezing, toilet, wearing clothes, entering house, exams, anxiety, sickness, etc.
Output only valid JSON!`;

  console.log('Generating duas...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "[]";
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/duas_data.json', text);
    console.log('Saved public/duas_data.json with length ' + text.length);
  } catch (e) {
    console.error(e);
  }
}
run();
