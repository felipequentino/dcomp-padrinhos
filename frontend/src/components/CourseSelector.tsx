import React from 'react';
import { Course } from '../types';
import { BookOpen, Cpu, Code, Bot } from 'lucide-react';

interface CourseSelectorProps {
  onSelectCourse: (course: Course) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelectCourse }) => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Qual é o seu curso?</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-white h-full p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('SI')}
        >
          <BookOpen className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2 min-h-14 flex items-center justify-center text-center">
            Sistemas de Informação
          </h3>
          <p className="text-sm text-center text-gray-600">Gestão e desenvolvimento de sistemas corporativos</p>
        </div>

        <div
          className="bg-white h-full p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('CC')}
        >
          <Code className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2 min-h-14 flex items-center justify-center text-center">
            Ciência da Computação
          </h3>
          <p className="text-sm text-center text-gray-600">Fundamentos e avanços da computação</p>
        </div>

        <div
          className="bg-white h-full p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('EC')}
        >
          <Cpu className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2 min-h-14 flex items-center justify-center text-center">
            Engenharia da Computação
          </h3>
          <p className="text-sm text-center text-gray-600">Hardware, software e integração de sistemas</p>
        </div>

        <div
          className="bg-white h-full p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('IA')}
        >
          <Bot className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2 min-h-14 flex items-center justify-center text-center">
            Inteligência Artificial
          </h3>
          <p className="text-sm text-center text-gray-600">Machine learning, dados e sistemas inteligentes</p>
        </div>
      </div>
    </div>
  );
};

export default CourseSelector;