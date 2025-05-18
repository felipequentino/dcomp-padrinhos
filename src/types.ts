export interface MentorPair {
  pair: Mentor[];
  availableSlots: number;
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

export type Course = 'SI' | 'CC' | 'EC';

export interface User {
  email: string;
  course?: Course;
  authenticated: boolean;
}