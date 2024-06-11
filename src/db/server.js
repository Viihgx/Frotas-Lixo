import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 4000;

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
    // Verifique se insertData não está vazio e contém os dados esperados
    if (!insertData || insertData.length === 0) {
      return res.status(500).json({ error: 'Erro ao inserir o bairro.' });
    }
    res.status(201).json(insertData);
  } else {
    res.status(404).json({ error: 'Bairro não encontrado' });
  }
});

// Endpoint para editar um bairro
app.put('/api/bairros/:id', async (req, res) => {
  const { id } = req.params;
  const { bairro_name, coleta_type, inicio_coleta, dias_coleta } = req.body;

  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${bairro_name},Fortaleza`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    const coordinates = [{ lat: parseFloat(lat), lon: parseFloat(lon) }];

    const { data: updateData, error: updateError } = await supabase.from('bairros').update({
      bairro_name, coleta_type, inicio_coleta, dias_coleta, coordinates
    }).eq('id', id).select();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
    if (updateData.length === 0) {
      return res.status(404).json({ error: 'Bairro not found' });
    }
    res.status(200).json(updateData[0]); // Retorne o primeiro objeto atualizado
  } else {
    res.status(404).json({ error: 'Bairro not found' });
  }
});

// Endpoint para excluir um bairro
app.delete('/api/bairros/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('bairros').delete().eq('id', id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
