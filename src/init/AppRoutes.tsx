import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import React from 'react';

import FaceBuilderScreen from "../faceBuilderScreen/FaceBuilderScreen";
import LipzGeneratorScreen from "../lipzGeneratorScreen/LipzGeneratorScreen";

function AppRoutes() {
  return (
    <BrowserRouter basename='/wisp-tool'>
      <Routes>
        <Route path="facebuilder" element={<FaceBuilderScreen />} />
        <Route path="lipzgen" element={<LipzGeneratorScreen />} />
        <Route path="*" element={<Navigate to="/facebuilder" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;