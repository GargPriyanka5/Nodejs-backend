require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Node Practical Task API'));

app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));