import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./features/landing/LandingPage";
import AuthScreen from "./features/auth/AuthScreen";
import HomeScreen from "./features/home/HomeScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        {/* Screens below will be implemented by other members */}
        {/* <Route path="/settings" element={<SettingsScreen />} /> */}
        {/* <Route path="/game" element={<GameScreen />} /> */}
        {/* Fallback to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

