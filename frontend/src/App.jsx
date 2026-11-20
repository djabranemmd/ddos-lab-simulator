
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";

import Overview from "./pages/Overview";
import Monitoring from "./pages/Monitoring";
import Detection from "./pages/Detection";
import Mitigation from "./pages/Mitigation";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/detection" element={<Detection />} />
          <Route path="/mitigation" element={<Mitigation />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
