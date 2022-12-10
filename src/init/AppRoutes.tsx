import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import React from 'react';

import FaceBuilderScreen from "../faceBuilderScreen/FaceBuilderScreen";
import LipzGeneratorScreen from "../lipzGeneratorScreen/LipzGeneratorScreen";
import HomeScreen from "../homeScreen/HomeScreen";

function AppRoutes() {
  return (
    <BrowserRouter basename='/wisp-tool'>
      <Routes>
        <Route path="" element={<HomeScreen />} />
        <Route path="facebuilder" element={<FaceBuilderScreen />} />
        <Route path="lipzgen" element={<LipzGeneratorScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;