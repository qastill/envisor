const { calcDevice, formatRp } = require('../config/electricity');

/**
 * POST /api/report/generate
 * Body: JSON { rooms, plnVa, jumlahOrang }
 * Returns a plain-text report suitable for email
 */
function generateReport(req, res) {
  try {
    const { rooms = [], plnVa = 1300, jumlahOrang = 3 } = req.body;

    const allDevs = rooms.flatMap((r) => r.devs.map((d) => ({ ...d, roomName: r.n })));
    const totalKwh = Math.round(allDevs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).kwh, 0));
    const totalCost = allDevs.reduce((a, d) => a + calcDevice(d.w, d.h, plnVa).cost, 0);

    const sorted = [...allDevs].sort(
      (a, b) => calcDevice(b.w, b.h, plnVa).cost - calcDevice(a.w, a.h, plnVa).cost
    );

    const lines = [
      'LAPORAN AUDIT LISTRIK — EnVisor AI',
      '',
      `Daya PLN   : ${plnVa.toLocaleString('id')} VA`,
      `Penghuni   : ${jumlahOrang} orang`,
      `Total kWh  : ${totalKwh} kWh/bulan`,
      `Estimasi   : ${formatRp(totalCost)}/bulan`,
      '',
      '5 PERANGKAT PALING BOROS:',
      ...sorted
        .slice(0, 5)
        .map((d, i) => `${i + 1}. ${d.n} (${d.roomName}) — ${formatRp(calcDevice(d.w, d.h, plnVa).cost)}/bln`),
      '',
      'Laporan lengkap: https://envisor.ai',
    ];

    return res.json({
      success: true,
      report: {
        text: lines.join('\n'),
        subject: 'Laporan Audit Listrik Rumah — EnVisor AI',
        totalCostFormatted: formatRp(totalCost),
        totalKwh,
      },
    });
  } catch (err) {
    console.error('[generateReport]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { generateReport };
