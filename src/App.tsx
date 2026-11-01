import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { CreateMystery } from './pages/CreateMystery.tsx';
import { InvestigationRoom } from './pages/InvestigationRoom.tsx';
import { Results } from './pages/Results.tsx';
import { NotFound } from './pages/NotFound.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0c0e14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-body">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMystery />} />
            <Route path="/investigation/:id" element={<InvestigationRoom />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
