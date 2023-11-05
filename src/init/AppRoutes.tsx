import FacesScreen from "facesScreen/FacesScreen";
import HomeScreen from "homeScreen/HomeScreen";
import LocationsScreen from "locationsScreen/LocationsScreen";
import ProjectsScreen from "projectsScreen/ProjectsScreen";
import SpeechScreen from "speechScreen/SpeechScreen";
import SpielsScreen from "spielsScreen/SpielsScreen";

import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import React from 'react';

function AppRoutes() {
  return (
    <BrowserRouter basename='/'>
      <Routes>
        <Route path="" element={<HomeScreen />} />
        <Route path="faces" element={<FacesScreen />} />
        <Route path="locations" element={<LocationsScreen />} />
        <Route path="projects" element={<ProjectsScreen />} />
        <Route path="speech" element={<SpeechScreen />} />
        <Route path="spiels" element={<SpielsScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;