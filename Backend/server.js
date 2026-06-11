import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';
import rootRouter from './Routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI?.trim();
const mongoDnsServers = process.env.MONGO_DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean) || ['8.8.8.8', '1.1.1.1'];
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    accessControlAllowCredentials: true
}

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api', rootRouter);
app.get('/', (req, res) => {
    res.send('Welcome to the API');
})
const startServer = async () => {
    if (!mongoUri) {
        console.error('MongoDB startup error: MONGO_URI is missing in your environment variables.');
        process.exit(1);
    }

    try {
        const mongoOptions = {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000
        };

        try {
            await mongoose.connect(mongoUri, mongoOptions);
        } catch (err) {
            const hasSrvLookupError = err.message?.includes('querySrv') || err.message?.includes('ECONNREFUSED _mongodb._tcp');
            if (!hasSrvLookupError) {
                throw err;
            }

            console.error('MongoDB SRV lookup failed using Node DNS resolver. Retrying with fallback DNS servers:', mongoDnsServers.join(', '));
            dns.setServers(mongoDnsServers);
            await mongoose.connect(mongoUri, mongoOptions);
        }

        app.listen(port, () => {
            console.log('MongoDB connected!');
            console.log(`🚀 Server is running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('MongoDB error:', err.message);

        if (err.message?.includes('querySrv') || err.message?.includes('ECONNREFUSED _mongodb._tcp')) {
            console.error('MongoDB SRV lookup failed. Check these items:');
            console.error('1) Atlas cluster hostname in MONGO_URI is correct.');
            console.error('2) Your DNS/network allows SRV lookups (port 53) for mongodb.net.');
            console.error('3) Try Atlas "standard connection string" (mongodb://...) instead of mongodb+srv:// if DNS blocks SRV.');
        }

        process.exit(1);
    }
};

startServer();
