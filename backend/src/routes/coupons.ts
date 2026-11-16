import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const validateCouponBodySchema = z.object({
  code: z.string().min(1, 'O código do cupom é obrigatório'),
});

const COUPONS: Record<string, number> = {
  VORTEX10: 10,
  GAMER20: 20,
};

export async function couponsRoutes(app: FastifyInstance) {
  app.post('/coupons/validate', async (request, reply) => {
    const parseResult = validateCouponBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Código de cupom inválido.',
        issues: parseResult.error.format(),
      });
    }

    const { code } = parseResult.data;
    const normalizedCode = code.trim().toUpperCase();

    const discountPercent = COUPONS[normalizedCode];

    if (!discountPercent) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        valid: false,
        message: 'Cupom de desconto inválido ou expirado.',
      });
    }

    return {
      valid: true,
      discountPercent,
      code: normalizedCode,
    };
  });
}

