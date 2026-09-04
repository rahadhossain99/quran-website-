export const getBanglaAudioUrl = (surahNumber: number): string | null => {
  const padded = String(surahNumber).padStart(3, '0');
  // High-reliability verified MP3 recitation with Bangla translation by Bangladesh Islamic Foundation
  return `https://archive.org/download/quranpakbotbn/${padded}.mp3`;
};
