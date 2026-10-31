import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './lib/prisma.js';

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

app.get('/categories', async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
});

app.get('/products', async (request) => {
  const { category } = request.query as { category?: string };

  const products = await prisma.product.findMany({
    where: category
      ? {
          category: {
            slug: category,
          },
        }
      : undefined,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return products.map((product) => ({
    ...product,
    specs: JSON.parse(product.specs),
  }));
});

app.get('/products/:slug', async (request, reply) => {
  const { slug } = request.params as { slug: string };

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Produto com slug '${slug}' não foi encontrado.`,
    });
  }

  return {
    ...product,
    specs: JSON.parse(product.specs),
  };
});

const start = async () => {
  try {
    await app.register(cors, {
      origin: true,
    });

    const port = 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`⚡ Servidor Vortex Gear rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
