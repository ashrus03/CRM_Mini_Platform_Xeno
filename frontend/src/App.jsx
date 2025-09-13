import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CampaignHistory from "./pages/CampaignHistory";
import CampaignBuilder from "./pages/CampaignBuilder";
import Ingest from "./pages/Ingest";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/campaigns/new" element={<CampaignBuilder />} />
          <Route path="/campaigns" element={<CampaignHistory />} />
          <Route path="/ingest" element={<Ingest />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
