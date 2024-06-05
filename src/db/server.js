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

app.get('/api/routes', async (req, res) => {
  const { data, error } = await supabase.from('rotas').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post('/api/routes', async (req, res) => {
  const { start_bairro, end_bairro, route } = req.body;
  const { data, error } = await supabase.from('rotas').insert([
    { start_bairro, end_bairro, route },
  ]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
