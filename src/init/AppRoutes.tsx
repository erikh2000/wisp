import FacesScreen from "facesScreen/FacesScreen";
import ProjectsScreen from "projectsScreen/ProjectsScreen";
import SpeechScreen from "speechScreen/SpeechScreen";
import SpielsScreen from "spielsScreen/SpielsScreen";
import HomeScreen from "homeScreen/HomeScreen";

import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import React from 'react';

function AppRoutes() {
  return (
    <BrowserRouter basename='/wisp-tool'>
      <Routes>
        <Route path="" element={<HomeScreen />} />
        <Route path="faces" element={<FacesScreen />} />
        <Route path="projects" element={<ProjectsScreen />} />
        <Route path="speech" element={<SpeechScreen />} />
        <Route path="spiels" element={<SpielsScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;