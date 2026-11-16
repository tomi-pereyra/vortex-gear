import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/categories', async () => {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  });

  app.get('/products', async (request) => {
    const { category, search } = request.query as {
      category?: string;
      search?: string;
    };

    const where: any = {};

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
}

