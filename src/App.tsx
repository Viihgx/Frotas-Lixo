import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapFrota from './Moderador';
import CadastroContato from './CadastroContato'; 

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapFrota />} />
        <Route path="/cadastro" element={<CadastroContato />} />
      </Routes>
    </Router>
  );
};

export default App;
