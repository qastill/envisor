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

/**
 * Analyze a device image using Anthropic Claude Vision API
 * Returns estimated device name, wattage, and suggested daily hours
 *
 * @param {Buffer} imageBuffer - image file buffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<{name: string, watts: number, dailyHours: number, emoji: string}>}
 */
async function analyzeDeviceImage(imageBuffer, mimeType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in environment');
  }

  const base64 = imageBuffer.toString('base64');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64 },
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
    throw new Error(`Anthropic API error: ${err}`);
  }

  const data = await response.json();
  const text = data.content.map((c) => c.text || '').join('');

  let parsed;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback if JSON parse fails
    parsed = { name: 'Perangkat Elektronik', watts: 100, dailyHours: 4 };
  }

  return {
    name: parsed.name || 'Perangkat Elektronik',
    watts: Number(parsed.watts) || 100,
    dailyHours: Number(parsed.dailyHours) || 4,
    emoji: getEmoji(parsed.name || ''),
  };
}

/**
 * Analyze a PLN bill image and extract the bill amount
 *
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @returns {Promise<{amount: number|null, kwh: number|null}>}
 */
async function analyzeBillImage(imageBuffer, mimeType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const base64 = imageBuffer.toString('base64');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64 },
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

  if (!response.ok) throw new Error('Anthropic API error');

  const data = await response.json();
  const text = data.content.map((c) => c.text || '').join('');

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { amount: null, kwh: null };
  }
}

module.exports = { analyzeDeviceImage, analyzeBillImage, getEmoji };
