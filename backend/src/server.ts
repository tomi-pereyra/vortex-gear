import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import { catalogRoutes } from './routes/catalog.js';
import { couponsRoutes } from './routes/coupons.js';
import { ordersRoutes } from './routes/orders.js';
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';

const app = Fastify({
  logger: true,
});

app.get('/status', async () => {
  return {
    status: 'online',
    service: 'Vortex Gear API',
    message: 'API da Vortex Gear está online e pronta para alta performance!',
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await app.register(cors, {
      origin: true,
    });

    await app.register(fjwt, {
      secret: process.env.JWT_SECRET || 'vortex-gear-super-secret-key-2026',
    });

    await app.register(authRoutes);
    await app.register(adminRoutes);
    await app.register(catalogRoutes);
    await app.register(couponsRoutes);
    await app.register(ordersRoutes);

    const port = 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`⚡ Servidor Vortex Gear rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
