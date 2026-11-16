import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { verifyAdmin, verifyJwt } from '../middlewares/auth.js';

const createProductBodySchema = z.object({
  name: z.string().min(2, 'Nome do produto é obrigatório'),
  slug: z.string().min(2, 'Slug é obrigatório'),
  description: z.string().min(5, 'Descrição é obrigatória'),
  price: z.number().positive('Preço deve ser positivo'),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative('Estoque não pode ser negativo'),
  imageUrl: z.string().url('URL da imagem inválida'),
  specs: z.union([z.string(), z.record(z.string(), z.any())]),
  featured: z.boolean().default(false),
  categoryId: z.string().uuid('Categoria inválida'),
});

const updateProductBodySchema = createProductBodySchema.partial();

export async function adminRoutes(app: FastifyInstance) {
  // Middleware de proteção para todas as rotas deste plugin: requer JWT válido e role ADMIN
  app.addHook('onRequest', async (request, reply) => {
    await verifyJwt(request, reply);
    if (reply.sent) return;
    await verifyAdmin(request, reply);
  });

  // GET /admin/stats
  app.get('/admin/stats', async () => {
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        select: {
          totalAmount: true,
          discountAmount: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalDiscountsGiven = orders.reduce(
      (acc, order) => acc + order.discountAmount,
      0
    );

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 5 },
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalDiscountsGiven: Number(totalDiscountsGiven.toFixed(2)),
      lowStockProducts,
    };
  });

  // GET /admin/orders
  app.get('/admin/orders', async () => {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  });

  // POST /admin/products
  app.post('/admin/products', async (request, reply) => {
    const parseResult = createProductBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados do produto inválidos.',
        issues: parseResult.error.format(),
      });
    }

    const { specs, ...data } = parseResult.data;
    const specsString = typeof specs === 'string' ? specs : JSON.stringify(specs);

    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Já existe um produto com este slug.',
      });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        specs: specsString,
      },
      include: {
        category: true,
      },
    });

    return reply.status(201).send({
      ...product,
      specs: JSON.parse(product.specs),
    });
  });

  // PATCH /admin/products/:id
  app.patch('/admin/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parseResult = updateProductBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados para atualização inválidos.',
        issues: parseResult.error.format(),
      });
    }

    const { specs, ...data } = parseResult.data;
    const updateData: any = { ...data };

    if (specs !== undefined) {
      updateData.specs = typeof specs === 'string' ? specs : JSON.stringify(specs);
    }

    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      });

      return {
        ...updatedProduct,
        specs: JSON.parse(updatedProduct.specs),
      };
    } catch (err) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Produto não encontrado para atualização.',
      });
    }
  });

  // DELETE /admin/products/:id
  app.delete('/admin/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      // Remove dependências de OrderItem caso existam para este produto de teste
      await prisma.orderItem.deleteMany({
        where: { productId: id },
      });

      await prisma.product.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (err) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Produto não encontrado para remoção.',
      });
    }
  });
}

