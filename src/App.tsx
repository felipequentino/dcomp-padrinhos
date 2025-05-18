import React from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { MentorProvider } from './contexts/MentorContext';
import LoginPage from './pages/LoginPage';
import CourseSelectionPage from './pages/CourseSelectionPage';
import MentorSelectionPage from './pages/MentorSelectionPage';

const AppContent: React.FC = () => {
  const { user } = useUser();
  
  if (!user.authenticated) {
    return <LoginPage />;
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
        <AppContent />
      </MentorProvider>
    </UserProvider>
  );
}

export default App;