import React, { type JSX } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import DoodleJumpReact from "./pages/DoodleJumpReact.tsx";


export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category" element={<CategoryPage />} />
      <Route path="/doodle-jump" element={<DoodleJumpReact />} />
    </Routes>
  );
}
