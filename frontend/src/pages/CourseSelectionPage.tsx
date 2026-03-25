import React from 'react';
import { Link } from 'react-router-dom';
import CourseSelector from '../components/CourseSelector';
import { useUser } from '../contexts/UserContext';
import { useMentors } from '../contexts/MentorContext';
import { Course } from '../types';
import { LogOut, Github } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

const CourseSelectionPage: React.FC = () => {
  const { user, setCourse, clearFreshman } = useUser();
  const { loadMentors } = useMentors();

  const handleSelectCourse = (course: Course) => {
    setCourse(course);
    void loadMentors(course);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      <header className="py-4 px-6 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-white">Escolha de Padrinhos</h1>
          <a
            href="https://github.com/felipequentino/dcomp-padrinhos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-200 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-white text-sm text-right max-w-[200px] truncate" title={user.name}>
            {user.name}
          </span>
          <button
            type="button"
            onClick={clearFreshman}
            className="text-white hover:text-blue-200 transition-colors flex items-center gap-1 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto py-12 bg-white rounded-lg shadow-xl mt-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Bem-vindo(a) ao Sistema de Padrinhos</h2>
          <p className="text-center text-gray-600 mb-4 mx-auto max-w-2xl px-4">
            Selecione o seu curso para ver as duplas de padrinhos disponíveis. Cada calouro pode escolher apenas uma
            dupla. Cada dupla pode acolher no máximo <strong>quatro</strong> calouros.
          </p>
          <p className="text-center text-sm text-gray-500 mb-8">
            <Link to="/padrinho" className="text-blue-800 underline">
              Sou padrinho/madrinha — cadastro
            </Link>
          </p>

          <CourseSelector onSelectCourse={handleSelectCourse} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default CourseSelectionPage;
