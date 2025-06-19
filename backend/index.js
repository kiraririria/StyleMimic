require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('StyleMimic Chat API Server is running!');
});

app.use('/api', chatRoutes);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});