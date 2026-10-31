import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.get('/status', async () => {
  return {
    status: 'online',
    service: 'Vortex Gear API',
    message: 'API da Vortex Gear está online e pronta para alta performance!',
    timestamp: new Date().toISOString(),
  };
});

app.get('/produtos-teste', async () => {
  return [
    {
      id: 'prod-01',
      nome: 'Mouse Gamer Vortex Phantom Pro Wireless 8000Hz (39g)',
      categoria: 'Mouses',
      preco: 849.9,
      estoque: 15,
    },
    {
      id: 'prod-02',
      nome: 'Teclado Mecânico Magnético Vortex Apex HE Rapid Trigger 60%',
      categoria: 'Teclados',
      preco: 1299.0,
      estoque: 8,
    },
    {
      id: 'prod-03',
      nome: 'Monitor Gamer Vortex Horizon 27" QHD Fast IPS 240Hz 0.5ms',
      categoria: 'Monitores',
      preco: 2499.9,
      estoque: 5,
    },
  ];
});

const start = async () => {
  try {
    const port = 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`⚡ Servidor Vortex Gear rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

