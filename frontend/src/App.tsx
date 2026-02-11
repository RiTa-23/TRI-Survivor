import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "./features/landing/LandingPage";
import AuthScreen from "./features/auth/AuthScreen";
import HomeScreen from "./features/home/HomeScreen";
import GameScreen from "./features/game/GameScreen";
import ShopScreen from "./features/shop/ShopScreen";
import SettingScreen from "./features/setting/SettingScreen";
import TutorialScreen from "./features/tutorial/TutorialScreen";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    let cleanup: (() => void) | void;
    let cancelled = false;

    initialize().then((c) => {
      if (cancelled) {
        if (typeof c === 'function') c();
      } else {
        cleanup = c;
      }
    });

    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthScreen />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/shop" element={<ShopScreen />} />
          <Route path="/setting" element={<SettingScreen />} />
          <Route path="/tutorial" element={<TutorialScreen />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

