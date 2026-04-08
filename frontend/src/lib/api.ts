import type { Course, Mentor, MentorPair } from '../types';

const base = () => (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

async function handleApiError(r: Response): Promise<never> {
  let msg = r.statusText;
  try {
    const text = await r.text();
    if (text) {
      try {
        const j = JSON.parse(text);
        if (j.detail) {
          if (typeof j.detail === 'string') {
            msg = j.detail;
          } else if (Array.isArray(j.detail)) {
            msg = j.detail.map((e: any) => e.msg).join(', ');
          } else {
            msg = JSON.stringify(j.detail);
          }
        } else {
          msg = text;
        }
      } catch {
        msg = text;
      }
    }
  } catch {
    // ignore
  }
  throw new Error(msg);
}

export interface ApiMentorPublic {
  name: string;
  matricula: string;
  music_artist: string | null;
  computing_area: string | null;
  celebrity: string | null;
  dream_destination: string | null;
  hobby: string | null;
  favorite_series: string | null;
  personal_description: string | null;
  photo_url: string | null;
  whatsapp: string;
}

export interface ApiPair {
  id: string;
  course: string;
  available_slots: number;
  max_slots: number;
  whatsapp_group_link: string | null;
  mentors: ApiMentorPublic[];
}

function mapMentor(m: ApiMentorPublic, course: Course): Mentor {
  return {
    name: m.name,
    musicArtist: m.music_artist ?? '',
    computingArea: m.computing_area ?? '',
    celebrity: m.celebrity ?? '',
    dreamDestination: m.dream_destination ?? '',
    hobby: m.hobby ?? '',
    favoriteSeries: m.favorite_series ?? '',
    course,
    personalDescription: m.personal_description ?? '',
    photoUrl: m.photo_url ?? '',
    whatsappLink: m.whatsapp,
  };
}

export async function fetchPairs(course: Course): Promise<MentorPair[]> {
  const r = await fetch(`${base()}/api/pairs?course=${encodeURIComponent(course)}`);
  if (!r.ok) await handleApiError(r);
  const data: ApiPair[] = await r.json();
  return data.map((p) => ({
    id: p.id,
    pair: p.mentors.map((m) => mapMentor(m, p.course as Course)),
    availableSlots: p.available_slots,
    maxSlots: p.max_slots,
    whatsappLink: p.whatsapp_group_link || p.mentors[0]?.whatsapp || '#',
  }));
}

export async function registerFreshmanSelection(body: {
  freshman_matricula: string;
  name: string;
  phone: string;
  course: Course;
  terms_accepted: boolean;
  pair_id: string;
}): Promise<{
  pair_id: string;
  mentor_a_name: string;
  mentor_b_name: string;
  mentor_a_whatsapp: string;
  mentor_b_whatsapp: string;
  message: string;
}> {
  const r = await fetch(`${base()}/api/freshman/register-and-select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) await handleApiError(r);
  return r.json();
}

export async function padrinhoLookup(matricula: string): Promise<{
  found: boolean;
  matricula?: string;
  nome_completo?: string;
  course?: string;
  whatsapp?: string;
  periodo?: string;
  foi_padrinho_antes?: boolean | null;
}> {
  const r = await fetch(`${base()}/api/padrinho/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricula }),
  });
  if (!r.ok) await handleApiError(r);
  return r.json();
}

export async function padrinhoRequestOtp(matricula: string, email: string): Promise<void> {
  const r = await fetch(`${base()}/api/padrinho/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricula, email }),
  });
  if (!r.ok) await handleApiError(r);
}

export async function padrinhoVerifyOtp(matricula: string, code: string): Promise<{ access_token: string }> {
  const r = await fetch(`${base()}/api/padrinho/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricula, code }),
  });
  if (!r.ok) await handleApiError(r);
  return r.json();
}

export async function padrinhoUpdateProfile(
  token: string,
  profile: Record<string, string | undefined>,
): Promise<void> {
  const r = await fetch(`${base()}/api/padrinho/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  if (!r.ok) await handleApiError(r);
}

export async function padrinhoUploadPhoto(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const r = await fetch(`${base()}/api/padrinho/upload-photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!r.ok) await handleApiError(r);
  return r.json();
}
