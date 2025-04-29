const express = require('express');
const cors = require('cors'); // ✅ přidáno

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // ✅ přidáno
app.use(express.json());

// Mock data - začátek
let plazi = [
  {
    id: '1',
    jmeno: 'Karel',
    druh: 'Krajta královská',
    pohlavi: 'Samec',
    narozeni: '2022-05-10',
    genetika: ['Albino', 'Pastel']
  },
  {
    id: '2',
    jmeno: 'Lili',
    druh: 'Leguán zelený',
    pohlavi: 'Samice',
    narozeni: '2021-03-15',
    genetika: ['Bez mutace']
  }
];

const druhy = ['Krajta královská', 'Leguán zelený', 'Chameleon jemenský', 'Želva uhlířská'];
const geny = ['Albino', 'Pastel', 'Piebald', 'Axanthic', 'Clown'];
// Mock data - konec

// Vrať všechny plazy
app.get('/plazi', (req, res) => {
  res.json(plazi);
});

// Přidat nového plaza
app.post('/plazi', (req, res) => {
  const { jmeno, druh, pohlavi, narozeni, genetika } = req.body;
  const novyPlaz = {
    id: Date.now().toString(),
    jmeno,
    druh,
    pohlavi,
    narozeni,
    genetika
  };
  plazi.push(novyPlaz);
  res.status(201).json(novyPlaz);
});

// Smazat plaza podle ID
app.delete('/plazi/:id', (req, res) => {
  const { id } = req.params;
  plazi = plazi.filter(plaz => plaz.id !== id);
  res.status(200).json({ message: 'Plaz smazán' });
});

// Vrať všechny dostupné druhy
app.get('/druhy', (req, res) => {
  res.json(druhy);
});

// Vrať všechny dostupné geny
app.get('/geny', (req, res) => {
  res.json(geny);
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
