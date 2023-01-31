import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import React from 'react';

import FacesScreen from "facesScreen/FacesScreen";
import SpielsScreen from "spielsScreen/SpielsScreen";
import LipzGeneratorScreen from "lipzGeneratorScreen/LipzGeneratorScreen";
import HomeScreen from "homeScreen/HomeScreen";

function AppRoutes() {
  return (
    <BrowserRouter basename='/wisp-tool'>
      <Routes>
        <Route path="" element={<HomeScreen />} />
        <Route path="faces" element={<FacesScreen />} />
        <Route path="lipzgen" element={<LipzGeneratorScreen />} />
        <Route path="spiels" element={<SpielsScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;