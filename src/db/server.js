import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 5000;

// Configurar Supabase
const supabaseUrl = 'https://hacmiubwmcfgqfpcjpel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY21pdWJ3bWNmZ3FmcGNqcGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTM1MDcsImV4cCI6MjAzMDc4OTUwN30.eM56RF8hHSibRPbTe4u_LXBQWqcrvFSwjuKfoqOOGtk';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Endpoint para buscar todos os bairros
app.get('/api/bairros', async (req, res) => {
  const { data, error } = await supabase.from('bairros').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Endpoint para adicionar um novo bairro
app.post('/api/bairros', async (req, res) => {
  const { bairro_name, coleta_type, inicio_coleta, dias_coleta } = req.body;
  
  // Fetch coordinates for the bairro
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${bairro_name},Fortaleza`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    const coordinates = [{ lat: parseFloat(lat), lon: parseFloat(lon) }]; // You can modify this to get the actual boundaries

    const { data: insertData, error: insertError } = await supabase.from('bairros').insert([
      { bairro_name, coleta_type, inicio_coleta, dias_coleta, coordinates },
    ]);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }
    res.status(201).json(insertData);
  } else {
    res.status(404).json({ error: 'Bairro not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});