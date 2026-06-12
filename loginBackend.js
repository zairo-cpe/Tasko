require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const PORT = process.env.PORT || 4000;

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

  res.json({ message: 'Account created!' });
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

// SEARCH USERS
app.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) return res.json([]);

  const { data, error } = await supabase
    .from('users')
    .select('username')
    .ilike('username', `%${query}%`)
    .limit(12);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// PROFILE
app.get('/profile', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json(data);
});

app.put('/profile/username', async (req, res) => {
  const { currentUsername, newUsername } = req.body;

  if (!currentUsername || !newUsername) {
    return res.status(400).json({ error: 'Current username and new username are required.' });
  }

  if (currentUsername === newUsername) {
    return res.status(400).json({ error: 'New username must be different.' });
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', currentUsername)
    .single();

  if (lookupError || !existingUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { data: duplicateUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', newUsername)
    .maybeSingle();

  if (duplicateUser) {
    return res.status(400).json({ error: 'Username already taken.' });
  }

  const documentsUpdate = await supabase
    .from('documents')
    .update({ username: newUsername })
    .eq('username', currentUsername);

  if (documentsUpdate.error) {
    return res.status(500).json({ error: documentsUpdate.error.message });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ username: newUsername })
    .eq('username', currentUsername)
    .select('id, username')
    .single();

  if (error || !data) {
    return res.status(500).json({ error: error ? error.message : 'Could not update username.' });
  }

  res.json({ message: 'Username updated.', user: data });
});

// DOCUMENTS
app.get('/documents', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const { data, error } = await supabase
    .from('documents')
    .select('id, username, title, content, created_at')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post('/documents', async (req, res) => {
  const { username, title, content } = req.body;

  if (!username || !title) {
    return res.status(400).json({ error: 'Username and title are required.' });
  }

  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        username,
        title,
        content: content || ''
      }
    ])
    .select('id, username, title, content, created_at')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.put('/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { username, title, content } = req.body;

  if (!username || !title) {
    return res.status(400).json({ error: 'Username and title are required.' });
  }

  const { data, error } = await supabase
    .from('documents')
    .update({
      title,
      content: content || ''
    })
    .eq('id', id)
    .eq('username', username)
    .select('id, username, title, content, created_at')
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  res.json(data);
});

app.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const { data, error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('username', username)
    .select('id');

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  res.json({ message: 'Document deleted.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});