const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const cron = require('cron');

// Configuração do Supabase
const supabaseUrl = 'https://hacmiubwmcfgqfpcjpel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhY21pdWJ3bWNmZ3FmcGNqcGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTM1MDcsImV4cCI6MjAzMDc4OTUwN30.eM56RF8hHSibRPbTe4u_LXBQWqcrvFSwjuKfoqOOGtk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eduardo.mbas@gmail.com', // substitua pelo seu e-mail
    pass: 'sanc qecx ldxw oznr' // substitua pela sua senha de aplicativo
  }
});

// Função para enviar notificações
async function enviarNotificacoes() {
  const { data: contatos, error } = await supabase
    .from('contatos')
    .select('*');

  if (error) {
    console.error('Erro ao obter contatos:', error.message);
    return;
  }

  const now = new Date();
  const diaSemana = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  console.log(`Verificando notificações para ${diaSemana} às ${now.toTimeString()}`);

  contatos.forEach(contato => {
    console.log(`Verificando contato: ${contato.nome}, ${contato.email}, ${contato.horario_notificacao}, ${contato.dias_notificacao}`);
    if (contato.dias_notificacao && contato.dias_notificacao.map(dia => dia.toLowerCase()).includes(diaSemana.toLowerCase())) {
      const [horas, minutos] = contato.horario_notificacao.split(':');
      const horarioNotificacao = new Date(now);
      horarioNotificacao.setHours(horas);
      horarioNotificacao.setMinutes(minutos);
      horarioNotificacao.setSeconds(0);
      console.log(`Horário de notificação para ${contato.nome}: ${horarioNotificacao.toLocaleTimeString()} no fuso horário local`);

      if (now.getHours() === horarioNotificacao.getHours() && now.getMinutes() === horarioNotificacao.getMinutes()) {
        console.log(`Enviando e-mail para ${contato.nome} (${contato.email})`);

        const mailOptions = {
          from: 'eduardo.mbas@gmail.com', // substitua pelo seu e-mail
          to: contato.email,
          subject: 'Lembrete de Coleta de Lixo',
          text: `Olá ${contato.nome},\n\nLembre-se que a coleta de lixo no bairro ${contato.bairro} será às ${contato.horario_coleta}.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Erro ao enviar e-mail:', error);
          } else {
            console.log('E-mail enviado:', info.response);
          }
        });
      } else {
        console.log(`Horário atual (${now.toLocaleTimeString()}) não coincide com o horário de notificação (${horarioNotificacao.toLocaleTimeString()}) para ${contato.nome}`);
      }
    } else {
      console.log(`Dia da semana atual (${diaSemana}) não está nos dias de notificação (${contato.dias_notificacao}) para ${contato.nome}`);
    }
  });
}

// Configuração do Cron Job para executar a cada minuto
const job = new cron.CronJob('* * * * *', enviarNotificacoes);
job.start();

// Mantém o script rodando
console.log('Cron job iniciado. Aguardando notificações...');
process.stdin.resume();
