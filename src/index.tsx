import React from 'react';
import {createRoot} from "react-dom/client";
import { init } from 'init/init';
import AppRoutes from "./init/AppRoutes";

init().then(() => { // If init() starts taking a noticeable amount of time, create a loading view.
  const container = document.getElementById('root') as Element;
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );
});