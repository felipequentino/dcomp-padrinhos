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
        <>
          <div aria-hidden="true" className="pointer-events-none fixed left-3 top-3 z-10">
            <img
              src="/hat.png"
              alt=""
              className="w-10 opacity-85 drop-shadow-lg sm:w-12 lg:w-14 -rotate-12"
            />
          </div>
          <div aria-hidden="true" className="pointer-events-none fixed right-3 top-3 z-10">
            <img
              src="/wand.png"
              alt=""
              className="w-10 opacity-85 drop-shadow-lg sm:w-12 lg:w-14 rotate-12"
            />
          </div>

          <Routes>
            <Route path="/" element={<CalouroRoutes />} />
            <Route path="/padrinho" element={<PadrinhoRegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      </MentorProvider>
    </UserProvider>
  );
}

export default App;
