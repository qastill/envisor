const { analyzeDeviceImage, analyzeBillImage } = require('../services/aiService');
const { calcDevice, formatRp, AVG_KWH_BY_VA, VA_OPTIONS } = require('../config/electricity');

/**
 * POST /api/analyze/device
 * Body: multipart/form-data with `image` file
 * Returns device info: name, watts, dailyHours, emoji, cost estimate
 */
async function analyzeDevice(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { va = 1300 } = req.body;
    const result = await analyzeDeviceImage(req.file.buffer, req.file.mimetype);
    const { kwh, cost } = calcDevice(result.watts, result.dailyHours, Number(va));

    return res.json({
      success: true,
      device: {
        ...result,
        kwh,
        costPerMonth: cost,
        costFormatted: formatRp(cost),
      },
    });
  } catch (err) {
    console.error('[analyzeDevice]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/analyze/bill
 * Body: multipart/form-data with `image` file
 * Returns extracted bill amount and kWh
 */
async function analyzeBill(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await analyzeBillImage(req.file.buffer, req.file.mimetype);
    return res.json({ success: true, bill: result });
  } catch (err) {
    console.error('[analyzeBill]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/analyze/summary
 * Body: JSON { rooms, plnVa, jumlahOrang, actualBill? }
 * Returns full analysis: totals, top devices, warnings, suggestions
 */
function buildSummary(req, res) {
  try {
    const { rooms = [], plnVa = 1300, jumlahOrang = 3, actualBill = 0 } = req.body;

    const allDevs = rooms.flatMap((r) =>
      r.devs.map((d) => ({ ...d, roomName: r.n, roomIcon: r.i }))
    );

    if (allDevs.length === 0) {
      return res.status(400).json({ error: 'No devices found in rooms' });
    }

    // Total consumption
    const totalKwh = allDevs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).kwh, 0);
    const totalCost = allDevs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).cost, 0);

    // Sort by cost descending
    const sorted = [...allDevs].sort(
      (a, b) => calcDevice(b.w, b.h, plnVa).cost - calcDevice(a.w, a.h, plnVa).cost
    );
    const top5 = sorted.slice(0, 5).map((d) => ({
      ...d,
      ...calcDevice(d.w, d.h, plnVa),
      costFormatted: formatRp(calcDevice(d.w, d.h, plnVa).cost),
    }));

    // Per-room breakdown
    const roomBreakdown = rooms.map((r) => {
      const rCost = r.devs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).cost, 0);
      const rKwh  = r.devs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).kwh, 0);
      return {
        id: r.id,
        name: r.n,
        icon: r.i,
        deviceCount: r.devs.length,
        kwh: Math.round(rKwh * 10) / 10,
        cost: rCost,
        costFormatted: formatRp(rCost),
        pct: totalCost > 0 ? Math.round((rCost / totalCost) * 100) : 0,
      };
    }).filter((r) => r.deviceCount > 0);

    // Comparison
    const vaKey = VA_OPTIONS.reduce((p, v) => (v <= plnVa ? v : p), VA_OPTIONS[0]);
    const avgKwh = AVG_KWH_BY_VA[vaKey] || 130;
    const vsAvgPct = avgKwh > 0 ? Math.round(((totalKwh - avgKwh) / avgKwh) * 100) : 0;
    const wajarKwh = jumlahOrang * 100;

    const diff = actualBill > 0 ? actualBill - totalCost : 0;
    const diffPct = actualBill > 0 ? Math.round((Math.abs(diff) / totalCost) * 100) : 0;
    const isOver = actualBill > 0 && diff > totalCost * 0.05;

    const suspectDev = sorted[0];
    const suspectShare =
      totalCost > 0
        ? Math.round((calcDevice(suspectDev?.w || 0, suspectDev?.h || 0, plnVa).cost / totalCost) * 100)
        : 0;

    const showWarning = isOver || totalKwh > wajarKwh * 1.1 || vsAvgPct > 10;

    return res.json({
      success: true,
      summary: {
        totalKwh: Math.round(totalKwh),
        totalCost,
        totalCostFormatted: formatRp(totalCost),
        deviceCount: allDevs.length,
        roomBreakdown,
        top5Devices: top5,
        comparison: {
          avgKwh,
          vsAvgPct,
          wajarKwh,
          isAboveAvg: vsAvgPct > 10,
        },
        billing: {
          actualBill,
          diff,
          diffPct,
          isOver,
        },
        suspectDevice: suspectDev
          ? { ...suspectDev, share: suspectShare }
          : null,
        showWarning,
      },
    });
  } catch (err) {
    console.error('[buildSummary]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/analyze/room
 * Body: JSON { image: base64string, mediaType: 'image/jpeg', roomLabel: 'Dapur' }
 * Returns: { devices: [{name, watts, dailyHours}] }
 */
async function analyzeRoom(req, res) {
  try {
    const { image, mediaType = 'image/jpeg', roomLabel = '' } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Decode base64 to buffer (strip data URL prefix if present)
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const result = await analyzeDeviceImage(buffer, mediaType);
    const { va = 1300 } = req.body;
    const { kwh, cost } = calcDevice(result.watts, result.dailyHours, Number(va));

    // If not electronic, return rejection
    if (result.isElectronic === false) {
      return res.json({
        success: true,
        devices: [{ isElectronic: false, name: '', watts: 0, dailyHours: 0, emoji: '' }]
      });
    }

    return res.json({
      success: true,
      devices: [{
        isElectronic: true,
        name: result.name,
        watts: result.watts,
        dailyHours: result.dailyHours,
        emoji: result.emoji,
        kwh,
        costPerMonth: cost,
      }]
    });
  } catch (err) {
    console.error('[analyzeRoom]', err.message);
    return res.status(500).json({ error: err.message });
  }
}


/**
 * POST /api/analyze/nameplate
 * Body: JSON { image: base64string, mediaType: 'image/jpeg', roomLabel: 'Dapur' }
 * Returns: { devices: [{name, watts, dailyHours}] }
 * Reads the name plate / label sticker of an appliance to get exact specs
 */
async function analyzeNameplate(req, res) {
  try {
    const { image, mediaType = 'image/jpeg', roomLabel = '' } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    
    const { analyzeNameplateImage } = require('../services/aiService');
    const result = await analyzeNameplateImage(buffer, mediaType);
    
    const { va = 1300 } = req.body;
    const { kwh, cost } = calcDevice(result.watts, result.dailyHours, Number(va));

    return res.json({
      success: true,
      devices: [{
        name: result.name,
        watts: result.watts,
        dailyHours: result.dailyHours,
        emoji: result.emoji,
        kwh,
        costPerMonth: cost,
      }]
    });
  } catch (err) {
    console.error('[analyzeNameplate]', err.message);
    return res.status(500).json({ error: err.message });
  }
}


/**
 * POST /api/analyze/meter-condition
 * Body: JSON { image: base64string, mediaType: 'image/jpeg' }
 * Returns: { condition: { type, estimatedAge, condition, brand, ... } }
 * Analyzes the physical condition of a KWH meter to assess accuracy risk
 */
async function analyzeMeterCondition(req, res) {
  try {
    const { image, mediaType = 'image/jpeg' } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const { analyzeKwhMeterCondition } = require('../services/aiService');
    const result = await analyzeKwhMeterCondition(buffer, mediaType);

    return res.json({ success: true, condition: result });
  } catch (err) {
    console.error('[analyzeMeterCondition]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { analyzeDevice, analyzeRoom, analyzeBill, buildSummary, analyzeNameplate, analyzeMeterCondition };
