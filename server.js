const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/ocupados', async (req, res) => {
  const [rows] = await db.query('SELECT data, horario FROM agendamentos');
  const ocupados = {};

  rows.forEach(row => {
    const dia = row.data.toISOString().split('T')[0];
    if (!ocupados[dia]) ocupados[dia] = [];
    ocupados[dia].push(row.horario.slice(0, 5));
  });

  res.json(ocupados);
});

app.post('/agendar', async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  const [result] = await db.query(
    'SELECT * FROM agendamentos WHERE data = ? AND horario = ?',
    [data, horario]
  );

  if (result.length > 0) {
    return res.status(400).json({ message: 'Horário já agendado!' });
  }

  await db.query(
    'INSERT INTO agendamentos (nome, telefone, servico, data, horario) VALUES (?, ?, ?, ?, ?)',
    [nome, telefone, servico, data, horario]
  );

  res.json({ message: 'Agendado com sucesso!' });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
