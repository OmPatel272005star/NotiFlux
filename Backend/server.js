import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors';
import connectDB from './src/utils/db.js';
import router from "./src/router/routes.js";

dotenv.config();
const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api", router);
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

