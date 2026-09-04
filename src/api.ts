import { SurahInfo, SurahData, Ayah, QARIS } from './types';
import { SURAH_LIST } from './data/surahList';
import { getBanglaAudioUrl, getAyahBanglaAudioUrl } from './data/specialReciters';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchAllSurahs = async (): Promise<SurahInfo[]> => {
  // Return embedded immutable Quran Surah metadata instantly for 0ms delay & 0 CLS
  return SURAH_LIST;
};

// Fetch just the audio URLs for a surah to allow instant, ultra-fast reciter switching
export const fetchSurahAudioOnly = async (number: number, qari: string): Promise<string[]> => {
  const isBangla = qari === 'special.bangla_translation';
  const qariValid = isBangla ? 'ar.alafasy' : (QARIS.some(q => q.id === qari) ? qari : 'ar.alafasy');
  const res = await fetch(`${BASE_URL}/surah/${number}/${qariValid}`);
  if (!res.ok) throw new Error('Failed to fetch surah audio');
  const data = await res.json();
  return data.data.ayahs.map((a: any) => a.audio);
};

// We fetch parallel editions to combine them into one seamless data structure
export const fetchSurahDetails = async (number: number, qari: string = 'ar.alafasy'): Promise<SurahData> => {
  const isBangla = qari === 'special.bangla_translation';
  const qariValid = isBangla ? 'ar.alafasy' : (QARIS.some(q => q.id === qari) ? qari : 'ar.alafasy');

  const res = await fetch(`${BASE_URL}/surah/${number}/editions/quran-uthmani,bn.bengali,en.transliteration,${qariValid}`);
  if (!res.ok) throw new Error('Failed to fetch surah details');
  
  const data = await res.json();
  
  const arabicEdition = data.data[0];
  const bengaliEdition = data.data[1];
  const translitEdition = data.data[2];
  const audioEdition = data.data[3];

  const banglaAudioUrl = getBanglaAudioUrl(number);

  const ayahs: Ayah[] = arabicEdition.ayahs.map((ayah: any, index: number) => ({
    numberInSurah: ayah.numberInSurah,
    arabicText: ayah.text,
    bengaliText: bengaliEdition.ayahs[index]?.text || '',
    transliterationText: translitEdition.ayahs[index]?.text || '',
    audioUrl: audioEdition.ayahs[index]?.audio || '',
    banglaAudioUrl: getAyahBanglaAudioUrl(number, ayah.numberInSurah),
  }));

  return {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    revelationType: arabicEdition.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী',
    numberOfAyahs: arabicEdition.numberOfAyahs,
    banglaAudioUrl,
    ayahs,
  };
};
