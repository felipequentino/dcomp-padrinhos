import React from 'react';
import { MentorPair } from '../types';
import GooglePhotoEmbed from './GooglePhotoEmbed';
import {
  Users, Music, Code, Star, Map, Gamepad2, Film,
} from 'lucide-react';


interface MentorCardProps {
  mentorPair: MentorPair;
  onClick: () => void;
  slots: number;
}



const MentorCard: React.FC<MentorCardProps> = ({ mentorPair, slots, onClick }) => {
  const { pair } = mentorPair;
  const disabled = slots === 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="absolute right-0 top-0 bg-blue-800 text-white px-3 py-1 rounded-bl-lg z-10">
        <span className="text-sm font-semibold">Vagas: {slots}/5</span>
      </div>

      {/* bloco com os dois mentores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {pair.map((mentor, idx) => (
          <article key={idx} className="flex flex-col h-full">
            {/* container com proporção fixa 1:1 */}
            <div className="relative w-full pt-[100%] rounded-lg mb-4 bg-gray-100">
              <GooglePhotoEmbed
                url={mentor.photoUrl}
                alt={mentor.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            {/* nome */}
            <h3 className="text-xl font-bold text-blue-900">{mentor.name}</h3>

            {/* afinidades */}
            <div className="mt-2 space-y-2 text-sm flex-grow">
              <p className="flex items-center"><Music className="w-4 h-4 text-blue-800 mr-2" /> {mentor.musicArtist}</p>
              <p className="flex items-start"><Code className="w-4 h-4 mt-1 text-blue-800 mr-2 flex-shrink-0" /> {mentor.computingArea}</p>
              <p className="flex items-center"><Star className="w-4 h-4 text-blue-800 mr-2" /> {mentor.celebrity}</p>
              <p className="flex items-center"><Map className="w-4 h-4 text-blue-800 mr-2" /> {mentor.dreamDestination}</p>
              <p className="flex items-center"><Gamepad2 className="w-4 h-4 text-blue-800 mr-2" /> {mentor.hobby}</p>
              <p className="flex items-center"><Film className="w-4 h-4 text-blue-800 mr-2" /> {mentor.favoriteSeries}</p>
            </div>

            {/* descrição completa – sem corte */}
            {mentor.personalDescription && (
              <p className="mt-3 text-gray-600 italic text-sm whitespace-pre-line">
                "{mentor.personalDescription}"
              </p>
            )}
          </article>
        ))}
      </div>

      {/* rodapé */}
      <footer className="bg-blue-50 p-4 flex items-center justify-between">
        <span className="flex items-center text-blue-900 font-medium">
          <Users className="w-5 h-5 text-blue-800 mr-2" />
          Dupla de Padrinhos
        </span>
        {slots > 0 ? (
          <span className="text-green-600 font-medium">Disponível</span>
        ) : (
          <span className="text-red-600 font-medium">Indisponível</span>
        )}
      </footer>
    </div>
  );
  
  
};

export default MentorCard;
