export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  numberInSurah: number;
  arabicText: string;
  bengaliText: string;
  transliterationText: string;
  audioUrl: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export const QARIS = [
  { id: 'ar.alafasy', name: 'মিশারি আল-আফাসি (Mishary Alafasy)' },
  { id: 'ar.abdurrahmaansudais', name: 'আব্দুর রহমান আস-সুদাইস (Sudais)' },
  { id: 'ar.abdulbasitmurattal', name: 'আব্দুল বাসিত আব্দুল সামাদ (AbdulBaset)' },
  { id: 'ar.husary', name: 'খলিল আল-হুসারি (Al-Husary)' },
  { id: 'ar.saadalghamidi', name: 'সাদ আল-গামদি (Saad Al Ghamdi)' },
  { id: 'ar.mahermuaiqly', name: 'মাহের আল মুয়াইক্লি (Maher Al Muaiqly)' },
  { id: 'ar.yasseraddossari', name: 'ইয়াসির আল-দোসারি (Yasser Al Dosari)' },
  { id: 'ar.minshawi', name: 'আল মিনশাওয়ি (Al-Minshawi)' },
  { id: 'ar.ayyoub', name: 'মুহাম্মদ আইয়ুব (Muhammad Ayyoub)' },
  { id: 'ar.jibril', name: 'মুহাম্মদ জিবরিল (Muhammad Jibreel)' },
  { id: 'ar.hudhaify', name: 'আলী আল হুজাইফি (Al Hudhaify)' }
];
