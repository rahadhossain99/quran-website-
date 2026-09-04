export const getBanglaAudioUrl = (surahNumber: number): string | null => {
  const padded = String(surahNumber).padStart(3, '0');
  // High-reliability verified MP3 recitation with Bangla translation by Bangladesh Islamic Foundation
  return `https://archive.org/download/quranpakbotbn/${padded}.mp3`;
};

// Verse-by-verse Bangla translation audio from quran.gov.bd (Islamic Foundation Bangladesh)
export const getAyahBanglaAudioUrl = (surahNumber: number, ayahNumberInSurah: number): string => {
  return `https://www.quran.gov.bd/quran/Sound/bangla/${surahNumber}/${surahNumber}-${ayahNumberInSurah}.mp3`;
};

// High-speed CDN mirror fallback
export const getAyahBanglaAudioFallbackUrl = (surahNumber: number, ayahNumberInSurah: number): string => {
  return `https://cdn.jsdelivr.net/gh/imranpollob/quran-text-audio-image-verse-by-verse@master/audio/bangla-translation/${surahNumber}-${ayahNumberInSurah}.mp3`;
};
