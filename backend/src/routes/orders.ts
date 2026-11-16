import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const COUPONS: Record<string, number> = {
  VORTEX10: 10,
  GAMER20: 20,
};

const createOrderBodySchema = z.object({
  customerName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  customerEmail: z.string().email('E-mail inválido'),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD']),
  couponCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('ID do produto inválido'),
        quantity: z.number().int().positive('Quantidade deve ser positiva'),
      })
    )
    .min(1, 'O pedido deve conter ao menos um item'),
});

export async function ordersRoutes(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    const parseResult = createOrderBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados do pedido inválidos.',
        issues: parseResult.error.format(),
      });
    }

    const { customerName, customerEmail, paymentMethod, couponCode, items } =
      parseResult.data;

    const productIds = items.map((i) => i.productId);
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (productsInDb.length !== items.length) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Um ou mais produtos selecionados não foram encontrados no catálogo.',
      });
    }

    const productMap = new Map(productsInDb.map((p) => [p.id, p]));

    // Validação de estoque
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}.`,
        });
      }
    }

    // Cálculo do subtotal usando discountPrice ?? price
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.discountPrice ?? product.price;
      subtotal += unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    // Desconto de cupom
    let couponDiscountPercent = 0;
    let normalizedCouponCode: string | null = null;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (COUPONS[code]) {
        couponDiscountPercent = COUPONS[code];
        normalizedCouponCode = code;
      }
    }

    let couponDiscountAmount = (subtotal * couponDiscountPercent) / 100;
    let amountAfterCoupon = subtotal - couponDiscountAmount;

    // Desconto extra de 5% no PIX
    let pixDiscountAmount = 0;
    if (paymentMethod === 'PIX') {
      pixDiscountAmount = (amountAfterCoupon * 5) / 100;
    }

    const totalDiscount = Number((couponDiscountAmount + pixDiscountAmount).toFixed(2));
    const totalAmount = Number((subtotal - totalDiscount).toFixed(2));

    try {
      const order = await prisma.$transaction(async (tx) => {
        // Reduz o estoque de cada produto
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Cria o Pedido com os itens
        const createdOrder = await tx.order.create({
          data: {
            customerName,
            customerEmail,
            paymentMethod,
            couponCode: normalizedCouponCode,
            discountAmount: totalDiscount,
            totalAmount,
            status: 'PAID',
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return createdOrder;
      });

      return reply.status(201).send(order);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Ocorreu um erro ao processar o pedido.',
      });
    }
  });

  app.get('/orders', async () => {
    const orders = await prisma.order.findMany({
      include: {
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
}

