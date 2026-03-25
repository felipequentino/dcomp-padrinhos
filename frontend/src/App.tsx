import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { MentorProvider } from './contexts/MentorContext';
import FreshmanIdentifyPage from './pages/FreshmanIdentifyPage';
import CourseSelectionPage from './pages/CourseSelectionPage';
import MentorSelectionPage from './pages/MentorSelectionPage';
import PadrinhoRegisterPage from './pages/PadrinhoRegisterPage';

const CalouroRoutes: React.FC = () => {
  const { identityComplete, user } = useUser();

  if (!identityComplete) {
    return <FreshmanIdentifyPage />;
  }

  if (!user.course) {
    return <CourseSelectionPage />;
  }

  return <MentorSelectionPage />;
};

function App() {
  return (
    <UserProvider>
      <MentorProvider>
        <Routes>
          <Route path="/" element={<CalouroRoutes />} />
          <Route path="/padrinho" element={<PadrinhoRegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MentorProvider>
    </UserProvider>
  );
}

export default App;
