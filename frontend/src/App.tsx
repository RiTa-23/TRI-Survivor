import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "./features/landing/LandingPage";
import AuthScreen from "./features/auth/AuthScreen";
import HomeScreen from "./features/home/HomeScreen";
import GameScreen from "./features/game/GameScreen";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    let cleanup: (() => void) | void;

    initialize().then((c) => {
      cleanup = c;
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

