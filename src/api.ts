import { SurahInfo, SurahData, Ayah } from './types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchAllSurahs = async (): Promise<SurahInfo[]> => {
  const res = await fetch(`${BASE_URL}/surah`);
  if (!res.ok) throw new Error('Failed to fetch surahs');
  const data = await res.json();
  return data.data;
};

// We fetch parallel editions to combine them into one seamless data structure
export const fetchSurahDetails = async (number: number, qari: string = 'ar.alafasy'): Promise<SurahData> => {
  const res = await fetch(`${BASE_URL}/surah/${number}/editions/quran-uthmani,bn.bengali,en.transliteration,${qari}`);
  if (!res.ok) throw new Error('Failed to fetch surah details');
  
  const data = await res.json();
  
  const arabicEdition = data.data[0];
  const bengaliEdition = data.data[1];
  const translitEdition = data.data[2];
  const audioEdition = data.data[3];

  const ayahs: Ayah[] = arabicEdition.ayahs.map((ayah: any, index: number) => ({
    numberInSurah: ayah.numberInSurah,
    arabicText: ayah.text,
    bengaliText: bengaliEdition.ayahs[index].text,
    transliterationText: translitEdition.ayahs[index].text,
    audioUrl: audioEdition.ayahs[index].audio,
  }));

  return {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    revelationType: arabicEdition.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী',
    numberOfAyahs: arabicEdition.numberOfAyahs,
    ayahs,
  };
};
