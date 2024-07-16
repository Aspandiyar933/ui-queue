import express from 'express';
import dotenv from 'dotenv';
import Queue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

(async() => {
    dotenv.config();

    const redisOptions = {
        redis: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD || undefined,
        },
    };


    const queuesList = ["burger"];
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    const queues = queuesList
        .map((qs) => new Queue(qs, redisOptions))
        .map((q) => new BullAdapter(q));

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues, 
        serverAdapter: serverAdapter,
    });

    const app = express();
    app.use("/admin/queues", serverAdapter.getRouter());

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.info(`Running on ${PORT}...`);
        console.info(`For the UI, open http://localhost:${PORT}/admin/queues`);
        console.info("Make sure Redis is running on port 6379 by default");
      });
})();