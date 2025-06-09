import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { NotionCRM } from './components/NotionCRM';
import { ProspectAI } from './components/ProspectAI';
import FileTransfer from './components/FileTransfer';
import { Historico } from './components/Historico';

export default function App() {
  return (
    <Router>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<FileTransfer />} />
          <Route path="/crm" element={<NotionCRM />} />
          <Route path="/prospectai" element={<ProspectAI />} />
          <Route path="/historico" element={<Historico />} />
        </Routes>
      </div>
    </Router>
  );
}
