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
              text: `Identify this household electrical appliance/device.
Return ONLY a JSON object (no markdown) with:
{
  "name": "device name in Indonesian (e.g. AC Split 1 PK)",
  "watts": estimated wattage as number,
  "dailyHours": typical daily usage hours as number
}
Be concise and realistic. If unclear, make a reasonable guess based on what you see.`,
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
