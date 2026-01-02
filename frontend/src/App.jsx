import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/landing.jsx';
import AuthenticationPage from './pages/authentication.jsx';
import AuthProvider from './contexts/AuthContext.jsx';
import AppTheme from './shared-theme/AppTheme.jsx';
import VideoMeetComponent from './pages/VideoMeet.jsx';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';


function App() {

  return (
   <>
   <AppTheme>
   <Router>
    <AuthProvider>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/auth" element={<AuthenticationPage/>}/>
      <Route path="/home" element={<HomeComponent/>}/>
      <Route path="/history" element={<History/>}/> 
      <Route path="/:url" element={<VideoMeetComponent/>}/>

    </Routes>
    </AuthProvider>
   </Router>
   </AppTheme>
   </> 
  )
}

export default App;
