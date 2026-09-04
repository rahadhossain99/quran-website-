// Astronomical Prayer Times Calculation specifically calibrated for Bangladesh (Islamic Foundation standard)
// Coordinates for Dhaka: 23.8103° N, 90.4125° E, UTC+6.0
// Fajr: 18.0°, Isha: 18.0°, Asr: Hanafi (shadow factor = 2)

export interface CalculatedPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  [key: string]: string;
}

export const toBengaliDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => {
    const digit = Number(d);
    return !isNaN(digit) && d !== ' ' ? bnDigits[digit] : d;
  }).join('');
};

export const calculatePrayerTimes = (
  lat: number = 23.8103,
  lng: number = 90.4125,
  timezone: number = 6.0,
  date: Date = new Date()
): CalculatedPrayerTimes => {
  // Day of year calculation
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar calculations
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eqTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)); // degrees

  const degToRad = Math.PI / 180;
  const radToDeg = 180 / Math.PI;

  const latRad = lat * degToRad;
  const decRad = declination * degToRad;

  // Solar Noon (Zawal/Dhuhr)
  const solarNoon = 12 + timezone - (lng / 15) - (eqTime / 60);

  // Hour angle helper
  const getHourAngle = (alphaDeg: number): number => {
    const alphaRad = alphaDeg * degToRad;
    const cosHA = (Math.sin(alphaRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180 / 15;
    return (Math.acos(cosHA) * radToDeg) / 15;
  };

  // Islamic Foundation Bangladesh standard: 18° Fajr & Isha
  const fajrHA = getHourAngle(-18);
  const sunHA = getHourAngle(-0.833); // Sun center at apparent horizon
  const ishaHA = getHourAngle(-18);

  // Hanafi Asr (Shadow factor = 2, standard in Bangladesh)
  const noonZenith = Math.abs(lat - declination) * degToRad;
  const asrAltRad = Math.atan(1 / (2 + Math.tan(noonZenith)));
  const asrAltDeg = asrAltRad * radToDeg;
  const asrHA = getHourAngle(asrAltDeg);

  const formatTime = (decimalHours: number): string => {
    let normalized = (decimalHours + 24) % 24;
    let h = Math.floor(normalized);
    let m = Math.round((normalized - h) * 60);
    if (m >= 60) {
      h = (h + 1) % 24;
      m = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const fajr = solarNoon - fajrHA;
  const sunrise = solarNoon - sunHA;
  const dhuhr = solarNoon + (2 / 60); // 2 mins safety buffer after solar noon
  const asr = solarNoon + asrHA;
  const sunset = solarNoon + sunHA;
  const maghrib = sunset + (2 / 60); // 2 mins safety buffer after sunset
  const isha = solarNoon + ishaHA;

  return {
    Fajr: formatTime(fajr),
    Sunrise: formatTime(sunrise),
    Dhuhr: formatTime(dhuhr),
    Asr: formatTime(asr),
    Sunset: formatTime(sunset),
    Maghrib: formatTime(maghrib),
    Isha: formatTime(isha),
    Imsak: formatTime(fajr - (10 / 60)), // 10 mins before Fajr
    Midnight: formatTime(solarNoon + 12)
  };
};

// Default Dhaka standard timings for immediate, guaranteed offline rendering
export const getDhakaStandardPrayerTimes = (date: Date = new Date()): CalculatedPrayerTimes => {
  return calculatePrayerTimes(23.8103, 90.4125, 6.0, date);
};
