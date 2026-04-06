export interface MentorPair {
  /** ID da dupla na API */
  id: string;
  pair: Mentor[];
  availableSlots: number;
  maxSlots: number;
  whatsappLink: string;
}

export interface Mentor {
  name: string;
  musicArtist: string;
  computingArea: string;
  celebrity: string;
  dreamDestination: string;
  hobby: string;
  favoriteSeries: string;
  course: string;
  personalDescription: string;
  photoUrl: string;
  whatsappLink: string;
}

export type Course = 'SI' | 'CC' | 'EC' | 'IA';

/** Dados do calouro na home (antes da escolha da dupla) */
export interface FreshmanUser {
  matricula: string;
  name: string;
  phone: string;
  termsAccepted: boolean;
  course?: Course;
}
