import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import AdminGate from './pages/AdminGate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminGate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
