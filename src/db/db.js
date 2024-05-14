import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hacmiubwmcfgqfpcjpel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY21pdWJ3bWNmZ3FmcGNqcGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTM1MDcsImV4cCI6MjAzMDc4OTUwN30.eM56RF8hHSibRPbTe4u_LXBQWqcrvFSwjuKfoqOOGtk'; 

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para adicionar uma rota ao Supabase
async function adicionarRota(bairro, horarioColeta, diaColeta) {
    try {
        const { data, error } = await supabase.from('rotas').insert([
            { bairro, horario_coleta: horarioColeta, dia_coleta: diaColeta }
        ]);

        if (error) {
            console.error('Erro ao adicionar rota:', error.message);
            return null;
        }

        console.log('Rota adicionada com sucesso:', data);
        return data;
    } catch (error) {
        console.error('Erro ao adicionar rota:', error.message);
        return null;
    }
}

//Função para obter rotas que já estão no banco de dados
async function obterRotas() {
    try {
        const { data, error } = await supabase.from('rotas').select('*');

        if (error) {
            console.error('Erro ao obter rotas:', error.message);
            return [];
        }

        console.log('Rotas obtidas com sucesso:', data);
        return data;
    } catch (error) {
        console.error('Erro ao obter rotas:', error.message);
        return [];
    }
}

export { supabase, adicionarRota, obterRotas };


// adicionarRota('Centro', '08:00', 'Segunda-feira');