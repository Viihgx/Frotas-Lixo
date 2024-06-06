import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hacmiubwmcfgqfpcjpel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY21pdWJ3bWNmZ3FmcGNqcGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTM1MDcsImV4cCI6MjAzMDc4OTUwN30.eM56RF8hHSibRPbTe4u_LXBQWqcrvFSwjuKfoqOOGtk'; 

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para adicionar um contato ao Supabase
async function adicionarContato(nome, email, bairro, horarioNotificacao, diasNotificacao) {
    try {
      // Verificar se o e-mail já existe
      const { data: existingContact, error: fetchError } = await supabase
        .from('contatos')
        .select('id')
        .eq('email', email)
        .single();
  
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 significa "No rows found"
        console.error('Erro ao verificar e-mail existente:', fetchError.message);
        return { success: false, error: fetchError.message };
      }
  
      if (existingContact) {
        return { success: false, error: 'E-mail já cadastrado.' };
      }
  
      // Inserir novo contato
      const { data, error } = await supabase.from('contatos').insert([
        { nome, email, bairro, horario_notificacao: horarioNotificacao, dias_notificacao: diasNotificacao }
      ]);
  
      if (error) {
        console.error('Erro ao adicionar contato:', error.message);
        return { success: false, error: error.message };
      }
  
      console.log('Contato adicionado com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar contato:', error.message);
      return { success: false, error: error.message };
    }
  }

  async function deletarContato(email) {
    try {
      const { data, error } = await supabase
        .from('contatos')
        .delete()
        .eq('email', email);
  
      if (error) {
        console.error('Erro ao deletar contato:', error.message);
        return { success: false, error: error.message };
      }
  
      console.log('Contato deletado com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao deletar contato:', error.message);
      return { success: false, error: error.message };
    }
  }

export { supabase, adicionarContato, deletarContato };
