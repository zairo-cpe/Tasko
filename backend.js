require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// REGISTER
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  const hashed = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ username, password: hashed }]);

  if (error) {
    const msg = error.code === '23505'
      ? 'Username already taken.'
      : error.message;
    return res.status(400).json({ error: msg });
  }

  res.json({ message: 'Account created! You can now log in.' });
});

// LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data)
    return res.status(401).json({ message: 'Invalid credentials.' });

  const valid = await bcrypt.compare(password, data.password);
  if (!valid)
    return res.status(401).json({ message: 'Invalid credentials.' });

  const token = jwt.sign(
    { id: data.id, username: data.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ message: `Welcome back, ${data.username}!`, token });
});

app.listen(4000, () => console.log('Server running on port 4000'));