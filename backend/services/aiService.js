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

async function toJpegBuffer(buffer) {
  try {
    const sharp = require('sharp');
    return await sharp(buffer).rotate().jpeg({ quality: 90 }).toBuffer();
  } catch (e) {
    return buffer; // fallback: use original
  }
}

async function analyzeDeviceImage(imageBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');

  // Always convert to JPEG — fixes HEIC/HEIF from iPhones & ensures quality
  const jpegBuffer = await toJpegBuffer(imageBuffer);
  const base64 = jpegBuffer.toString('base64');
  mimeType = 'image/jpeg';

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
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: `You are an expert electrician identifying household appliances in Indonesian homes.

IMPORTANT RULES:
1. Look at the FULL object carefully — shape, size, door/panel, features
2. Kulkas/refrigerator: has door(s), often white/silver, taller than wide, stored food
3. AC indoor unit: long horizontal box mounted on wall near ceiling
4. AC outdoor unit: boxy with fan grille, placed outside
5. NEVER confuse kulkas with AC — they look completely different
6. If you see a large white/silver vertical box with handle and door = KULKAS
7. If you see horizontal wall-mounted unit = AC indoor
8. Be specific: "Kulkas 1 Pintu", "Kulkas 2 Pintu", "AC Split 1 PK", "TV LED 43 inch"

Reference wattage for Indonesian homes:
Kulkas 1 pintu=80W/24h | Kulkas 2 pintu=150W/24h | Kulkas side-by-side=250W/24h
AC 0.5PK=400W/8h | AC 1PK=750W/8h | AC 1.5PK=1200W/8h | AC 2PK=1800W/8h
TV LED 32"=50W/6h | TV LED 43"=80W/6h | TV LED 55"=120W/6h
Mesin Cuci=400W/1h | Pompa Air=250W/2h | Rice Cooker=400W/1h
Setrika=350W/1h | Dispenser=350W/10h | Microwave=1000W/0.5h
Laptop=65W/8h | PC Desktop=300W/8h | Lampu LED=10W/8h | Kipas Angin=50W/8h

Return ONLY valid JSON (no markdown):
{"name":"nama spesifik dalam Bahasa Indonesia","watts":number,"dailyHours":number}`,
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
