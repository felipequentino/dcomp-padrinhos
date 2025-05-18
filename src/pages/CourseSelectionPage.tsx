import React from 'react';
import CourseSelector from '../components/CourseSelector';
import { useUser } from '../contexts/UserContext';
import { useMentors } from '../contexts/MentorContext';
import { Course } from '../types';
import { LogOut } from 'lucide-react';

const CourseSelectionPage: React.FC = () => {
  const { user, setCourse, logout } = useUser();
  const { loadMentors } = useMentors();
  
  const handleSelectCourse = (course: Course) => {
    setCourse(course);
    loadMentors(course);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      <header className="py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Escolha de Padrinhos</h1>
        <div className="flex items-center">
          <span className="text-white mr-4">{user.email}</span>
          <button 
            onClick={logout}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto py-12 bg-white rounded-lg shadow-xl mt-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
            Bem-vindo(a) ao Sistema de Padrinhos
          </h2>
          <p className="text-center text-gray-600 mb-8 mx-auto max-w-2xl px-4">
            Selecione o seu curso para ver as duplas de padrinhos disponíveis para você. 
            Cada calouro pode escolher apenas uma dupla, baseado em afinidades e interesses.
          </p>
          
          <CourseSelector onSelectCourse={handleSelectCourse} />
        </div>
      </main>
    </div>
  );
};

export default CourseSelectionPage;