// ① Load .env first — always at the very top
require('dotenv').config();

// ② Import packages
const express      = require('express');
const cors         = require('cors');
const bcrypt       = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// ③ Create the Express app
const app = express();

// ④ Add middleware (must come AFTER app is created)
app.use(cors());           // allow frontend to talk to backend
app.use(express.json());  // parse JSON request bodies

// ⑤ Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ⑥ Routes

// REGISTER — creates a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ username, password: hashed }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User registered successfully!' });
});

// LOGIN — checks credentials
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data)
    return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, data.password);
  if (!valid)
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ message: `Welcome back, ${data.username}!` });
});

// ⑦ Start the server — always last
app.listen(4000, () => console.log('Server running on port 4000'));