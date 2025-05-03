require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./utils/db');

const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://bunker-frontend-roan.vercel.app'
    ],
    credentials: true,
}));
app.use(express.json());

app.use('/api/files',fileRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req,res) => {
    res.send('📁 Bunker says `Pong 🏓`');
})

app.use((err, req, res, next) => {
    console.log(req.method, req.method)
    console.error("ERRROR", req.method, req.path ,err.stack);
    res.status(500).json({error: "Internal Server Error"});
})

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Bunker API running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    })