const { calcDevice } = require('../config/electricity');

const DEVICE_EMOJI_MAP = {
  ac: '❄️', 'air con': '❄️', pendingin: '❄️',
  kulkas: '🧊', refrig: '🧊', freeze: '🧊',
  tv: '📺', tele: '📺', monitor: '📺',
  cuci: '🫧', wash: '🫧',
  lampu: '💡', light: '💡', led: '💡',
  laptop: '💻', computer: '💻', pc: '💻',
  heater: '🚿', pemanas: '🚿', water: '🚿',
  rice: '🍚', nasi: '🍚',
  microwave: '📡', oven: '📡',
  kipas: '🌀', fan: '🌀',
  dispenser: '🥤',
  pompa: '💧', pump: '💧',
};

function getEmoji(name) {
  const n = name.toLowerCase();
  for (const [key, emoji] of Object.entries(DEVICE_EMOJI_MAP)) {
    if (n.includes(key)) return emoji;
  }
  return '🔌';
}

async function analyzeDeviceImage(imageBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');

  const base64 = imageBuffer.toString('base64');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: 'text',
              text: `You are an expert at identifying household electrical appliances from photos.

Look carefully at the EXACT object in this photo and identify it precisely.
DO NOT guess or substitute — if it looks like a refrigerator, say refrigerator. If it looks like an AC, say AC.

Common Indonesian household devices and their typical wattage:
- Kulkas 1 pintu: 70-100W, 24h/day
- Kulkas 2 pintu: 150-200W, 24h/day
- AC Split 0.5 PK: 400W, 8h/day
- AC Split 1 PK: 750W, 8h/day
- AC Split 1.5 PK: 1200W, 8h/day
- TV LED 32 inch: 50W, 6h/day
- TV LED 55 inch: 120W, 6h/day
- Mesin Cuci: 300-500W, 1h/day
- Pompa Air: 250W, 2h/day
- Rice Cooker: 400W, 1h/day
- Setrika: 350W, 1h/day
- Dispenser: 350W, 10h/day
- Microwave: 1000W, 0.5h/day
- Laptop: 65W, 8h/day
- Lampu LED: 10W, 8h/day

Identify what you actually see in the photo. Return ONLY a JSON object (no markdown, no explanation):
{
  "name": "nama perangkat dalam Bahasa Indonesia (spesifik, contoh: Kulkas 2 Pintu, AC Split 1 PK)",
  "watts": wattage as number,
  "dailyHours": typical daily usage hours as number
}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  let parsed;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { name: 'Perangkat Elektronik', watts: 100, dailyHours: 4 };
  }

  return {
    name: parsed.name || 'Perangkat Elektronik',
    watts: Number(parsed.watts) || 100,
    dailyHours: Number(parsed.dailyHours) || 4,
    emoji: getEmoji(parsed.name || ''),
  };
}

async function analyzeBillImage(imageBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const base64 = imageBuffer.toString('base64');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: 'text',
              text: `This is a PLN electricity bill or KWH meter photo.
Return ONLY a JSON object (no markdown):
{
  "amount": total bill amount in Rupiah as number (or null if not found),
  "kwh": kWh usage as number (or null if not found)
}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error('OpenAI API error');

  const data = await response.json();
  const text = data.choices[0].message.content;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { amount: null, kwh: null };
  }
}

module.exports = { analyzeDeviceImage, analyzeBillImage, getEmoji };
