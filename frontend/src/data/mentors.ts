import * as Papa from 'papaparse';
import type { Course, Mentor, MentorPair } from '../types';

/* ------------ utilidades de I/O ---------------------------------------- */

import siCsv from './si.csv?raw';
import ecCsv from './ec.csv?raw';
import ccCsv from './cc.csv?raw';

/* ------------ mapeamento de colunas ------------------------------------ */

const header: Record<keyof Mentor | 'whatsappLink', string[]> = {
  name:              ['Nome'],
  musicArtist:       ['Artista musical favorito'],
  computingArea:     ['Área de computação preferida'],
  celebrity:         ['Celebridade que chamaria para uma festa'],
  dreamDestination:  ['Lugar que sonha em viajar'],
  hobby:            ['Hobby'],
  favoriteSeries:    ['Série Favorita'],
  course:            ['Curso'],
  personalDescription: ['Descrição pessoal', 'Descrição Pessoal'],
  photoUrl:          ['Link para a foto'],
  whatsappLink:      ['Link do Grupo do Whatsapp', 'Link do grupo do Whatsapp'],
};

/* ------------ parse de uma linha -------------------------------------- */

function rowToMentor(row: Papa.ParseResult<unknown>['data'][number]): Mentor {
  // helper que procura o valor em qualquer um dos nomes possíveis
  const pick = (aliases: string[]) =>
    aliases.map(a => (row as Record<string, string>)[a]?.trim()).find(Boolean) ?? '';

  return {
    name:             pick(header.name),
    musicArtist:      pick(header.musicArtist),
    computingArea:    pick(header.computingArea),
    celebrity:        pick(header.celebrity),
    dreamDestination: pick(header.dreamDestination),
    hobby:            pick(header.hobby),
    favoriteSeries:   pick(header.favoriteSeries),
    course:           pick(header.course),
    personalDescription: pick(header.personalDescription),
    photoUrl:         pick(header.photoUrl),
    whatsappLink:     pick(header.whatsappLink),
  };
}

/* ------------ agrupamento em duplas ----------------------------------- */

function makePairs(mentors: Mentor[], whatsappCol: string[]): MentorPair[] {
  if (!Array.isArray(mentors)) return [];
  
  const pairs: MentorPair[] = [];

  for (let i = 0; i < mentors.length; i += 2) {
    if (!mentors[i + 1]) break; // ignora ímpar solto (caso aconteça)

    const whatsappLink =
      (mentors as unknown as Record<string, string>[])[i][whatsappCol[0]] ??
      (mentors as unknown as Record<string, string>[])[i][whatsappCol[1]] ??
      '#';

    pairs.push({
      pair: [mentors[i], mentors[i + 1]],
      availableSlots: 5,
      whatsappLink,
    });
  }

  return pairs;
}

/* ------------ API principal ------------------------------------------- */

/**
 * Devolve as duplas (na ordem em que aparecem no CSV) para SI, EC ou CC.
 */
export function getMentorPairsByCourse(course: Course): MentorPair[] {
  try {
    let rawCsv: string;
    
    switch (course) {
      case 'SI':
        rawCsv = siCsv;
        break;
      case 'EC':
        rawCsv = ecCsv;
        break;
      case 'CC':
        rawCsv = ccCsv;
        break;
      default:
        console.error(`Curso inválido: ${course}`);
        return [];
    }

    const { data } = Papa.parse(rawCsv, {
      header: true,
      skipEmptyLines: true,
    });

    if (!Array.isArray(data)) {
      console.error('CSV parsing did not return an array');
      return [];
    }

    const mentors = (data as Record<string, string>[]).map(rowToMentor);
    return makePairs(mentors, header.whatsappLink);
  } catch (error) {
    console.error('Error parsing mentor data:', error);
    return [];
  }
}