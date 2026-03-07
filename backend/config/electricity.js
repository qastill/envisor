// PLN tariff brackets (Rp/kWh) — Indonesia 2024
const TARIFF_BY_VA = {
  900:  1352,
  1300: 1444,
  2200: 1444,
  3500: 1699,
  5500: 1699,
  7700: 1699,
};

// Average monthly kWh consumption by VA (PLN reference data)
const AVG_KWH_BY_VA = {
  900:   70,
  1300: 130,
  2200: 220,
  3500: 360,
  5500: 560,
  7700: 780,
};

const VA_OPTIONS = [900, 1300, 2200, 3500, 5500, 7700];

/**
 * Get PLN tariff for a given VA
 * @param {number} va
 * @returns {number} Rp/kWh
 */
function getTariff(va) {
  const key = VA_OPTIONS.reduce((prev, v) => (v <= va ? v : prev), VA_OPTIONS[0]);
  return TARIFF_BY_VA[key] || 1444;
}

/**
 * Calculate monthly kWh and cost for a device
 * @param {number} watts - device wattage
 * @param {number} hoursPerDay - daily usage hours
 * @param {number} va - PLN daya
 * @returns {{ kwh: number, cost: number }}
 */
function calcDevice(watts, hoursPerDay, va = 1300) {
  const kwh = (watts * hoursPerDay * 30) / 1000;
  const cost = Math.round(kwh * getTariff(va));
  return { kwh: Math.round(kwh * 10) / 10, cost };
}

/**
 * Format Rupiah
 * @param {number} n
 * @returns {string}
 */
function formatRp(n) {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + ' jt';
  if (n >= 1_000)     return 'Rp ' + Math.round(n / 1_000) + 'rb';
  return 'Rp ' + n;
}

module.exports = { getTariff, calcDevice, formatRp, AVG_KWH_BY_VA, VA_OPTIONS };
