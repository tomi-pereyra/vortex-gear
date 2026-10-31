import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { verifyJwt } from '../middlewares/auth.js';

const registerBodySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const loginBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const googleAuthBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  googleId: z.string().min(1, 'Google ID é obrigatório'),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/auth/register', async (request, reply) => {
    const parseResult = registerBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados de cadastro inválidos.',
        issues: parseResult.error.format(),
      });
    }

    const { name, email, password } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Já existe um usuário cadastrado com este e-mail.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    const token = app.jwt.sign(
      { role: user.role, name: user.name, email: user.email },
      { sub: user.id, expiresIn: '7d' }
    );

    return reply.status(201).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  });

  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const parseResult = loginBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Credenciais inválidas.',
        issues: parseResult.error.format(),
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'E-mail ou senha incorretos.',
      });
    }

    if (!user.passwordHash) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message:
          'Esta conta foi criada com Google. Por favor, utilize o botão "Entrar com Google".',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = app.jwt.sign(
      { role: user.role, name: user.name, email: user.email },
      { sub: user.id, expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  });

  // POST /auth/google
  app.post('/auth/google', async (request, reply) => {
    const parseResult = googleAuthBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados de autenticação Google inválidos.',
        issues: parseResult.error.format(),
      });
    }

    const { email, name, googleId, avatarUrl } = parseResult.data;

    // Busca usuário existente por email ou googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (user) {
      // Atualiza vínculo com Google e avatar se fornecido
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatarUrl: avatarUrl || user.avatarUrl,
        },
      });
    } else {
      // Cria novo usuário como CUSTOMER
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl: avatarUrl || null,
          role: 'CUSTOMER',
        },
      });
    }

    const token = app.jwt.sign(
      { role: user.role, name: user.name, email: user.email },
      { sub: user.id, expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  });

  // GET /auth/me
  app.get(
    '/auth/me',
    { onRequest: [verifyJwt] },
    async (request, reply) => {
      const { sub: userId } = request.user as { sub: string };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          orders: {
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
          },
        },
      });

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Usuário não encontrado.',
        });
      }

      return user;
    }
  );
}

