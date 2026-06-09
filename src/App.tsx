import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropertyList from '@/pages/PropertyList';
import FloorPlan from '@/pages/FloorPlan';
import Roam from '@/pages/Roam';
import Tour from '@/pages/Tour';
import Compare from '@/pages/Compare';
import Notes from '@/pages/Notes';
import Quote from '@/pages/Quote';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PropertyList />} />
        <Route path="/property/:id/floorplan" element={<FloorPlan />} />
        <Route path="/property/:id/roam" element={<Roam />} />
        <Route path="/property/:id/tour" element={<Tour />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
