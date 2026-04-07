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

CRITICAL FIRST CHECK:
- Look at the image carefully. Is this a household ELECTRONIC / ELECTRICAL appliance?
- Electronic appliances include: AC, kulkas, TV, mesin cuci, microwave, rice cooker, kipas angin, lampu, laptop, PC, dispenser, pompa air, setrika, blender, oven, water heater, etc.
- NON-electronic items include: furniture (meja, kursi, sofa, lemari kayu), clothing, food, plants, people, animals, documents, walls, floors, decorations, toys (non-electronic), books, bags, shoes, etc.
- If the image does NOT contain any electronic/electrical appliance, return: {"isElectronic":false,"name":"","watts":0,"dailyHours":0}

IF IT IS AN ELECTRONIC APPLIANCE:
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
If electronic: {"isElectronic":true,"name":"nama spesifik dalam Bahasa Indonesia","watts":number,"dailyHours":number}
If NOT electronic: {"isElectronic":false,"name":"","watts":0,"dailyHours":0}`,
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
    parsed = { isElectronic: true, name: 'Perangkat Elektronik', watts: 100, dailyHours: 4 };
  }

  return {
    isElectronic: parsed.isElectronic !== false,
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


async function analyzeNameplateImage(imageBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');

  const jpegBuffer = await toJpegBuffer(imageBuffer);
  const base64 = jpegBuffer.toString('base64');
  mimeType = 'image/jpeg';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: 'data:' + mimeType + ';base64,' + base64, detail: 'high' },
            },
            {
              type: 'text',
              text: 'This is a photo of a NAME PLATE / LABEL STICKER on a household appliance. Read the text carefully.\n\nIMPORTANT: Extract the following from the name plate:\n1. Brand/Merk (e.g., Daikin, Samsung, LG, Panasonic, Sharp, Polytron, etc.)\n2. Model number\n3. Wattage (look for W, Watt, Watts, VA, or power consumption)\n4. Type of appliance\n\nRULES:\n- If you see "Input: 220V 4.5A" then watts = 220 * 4.5 = 990W\n- If you see "Power: 780W" then watts = 780\n- If you see "Cooling capacity" in BTU, estimate watts: 5000BTU~500W, 9000BTU~750W, 12000BTU~1000W, 18000BTU~1500W, 24000BTU~2000W\n- If label says power consumption in kW, convert: 1kW = 1000W\n- For AC: differentiate between rated input power (use this) vs cooling capacity\n- dailyHours: estimate typical Indonesian household usage\n\nReturn ONLY valid JSON (no markdown):\n{"name":"Merk + Tipe dalam Bahasa Indonesia (contoh: AC Split Daikin FTC25NV14 1 PK)","watts":number,"dailyHours":number}',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('OpenAI API error: ' + err);
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


async function analyzeKwhMeterCondition(imageBuffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');

  const jpegBuffer = await toJpegBuffer(imageBuffer);
  const base64 = jpegBuffer.toString('base64');
  mimeType = 'image/jpeg';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: 'data:' + mimeType + ';base64,' + base64, detail: 'high' },
            },
            {
              type: 'text',
              text: 'This is a photo of a KWH meter (electricity meter) in an Indonesian home. Analyze the CONDITION and TYPE of this meter carefully.\n\nDetermine:\n1. Meter type: "analog" (Ferraris disk type with spinning wheel) or "digital" (LCD/LED display, token/prepaid)\n2. Estimated age: estimate how old the meter looks (in years). Look for: rust, fading, yellowing of casing, dust/dirt buildup, old-style design, wear marks\n3. Condition: "baik" (good - clean, relatively new looking), "cukup" (fair - some wear, moderate age), "tua" (old - significant wear, yellowing, rust, very old design), "sangat_tua" (very old - severely degraded, heavily rusted, barely readable)\n4. Brand if visible (e.g., Itron, Hexing, Edmi, Star, Fuji, Conlog, Glomet)\n5. Any visible damage or issues\n6. Whether calibration sticker/seal is visible and its year if readable\n\nIMPORTANT RULES:\n- Analog meters with spinning disk are typically older technology\n- Digital/prepaid meters are typically newer (post-2010)\n- Yellowed/discolored plastic casing = old meter (8+ years)\n- Rust on metal parts = old meter\n- If seal/sticker shows year, use that to estimate age\n- Meters older than 8-10 years may have accuracy drift of 5-15%\n\nReturn ONLY valid JSON (no markdown):\n{"type":"analog"|"digital","estimatedAge":number_in_years,"condition":"baik"|"cukup"|"tua"|"sangat_tua","brand":"string or empty","hasCalibrationSeal":boolean,"sealYear":number_or_null,"issues":["list of visible issues"],"accuracyRisk":"rendah"|"sedang"|"tinggi"|"sangat_tinggi"}',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('OpenAI API error: ' + err);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  let parsed;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { type: 'unknown', estimatedAge: 0, condition: 'cukup', brand: '', hasCalibrationSeal: false, sealYear: null, issues: [], accuracyRisk: 'sedang' };
  }

  return {
    type: parsed.type || 'unknown',
    estimatedAge: Number(parsed.estimatedAge) || 0,
    condition: parsed.condition || 'cukup',
    brand: parsed.brand || '',
    hasCalibrationSeal: !!parsed.hasCalibrationSeal,
    sealYear: parsed.sealYear || null,
    issues: parsed.issues || [],
    accuracyRisk: parsed.accuracyRisk || 'sedang',
  };
}

module.exports = { analyzeDeviceImage, analyzeBillImage, analyzeNameplateImage, analyzeKwhMeterCondition, getEmoji };
