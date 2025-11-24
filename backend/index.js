// backend/index.js
import app from './src/app.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`TripShare API listening on http://localhost:${port}`);
});
