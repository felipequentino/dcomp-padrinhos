import React from 'react';
import { Course } from '../types';
import { BookOpen, Cpu, Code } from 'lucide-react';

interface CourseSelectorProps {
  onSelectCourse: (course: Course) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelectCourse }) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Qual é o seu curso?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('SI')}
        >
          <BookOpen className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Sistemas de Informação</h3>
          <p className="text-sm text-center text-gray-600">Gestão e desenvolvimento de sistemas corporativos</p>
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('CC')}
        >
          <Code className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Ciência da Computação</h3>
          <p className="text-sm text-center text-gray-600">Fundamentos e avanços da computação</p>
        </div>
        
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-800 flex flex-col items-center"
          onClick={() => onSelectCourse('EC')}
        >
          <Cpu className="w-16 h-16 text-blue-800 mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Engenharia da Computação</h3>
          <p className="text-sm text-center text-gray-600">Hardware, software e integração de sistemas</p>
        </div>
      </div>
    </div>
  );
};

export default CourseSelector;