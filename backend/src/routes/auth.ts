import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { verifyJwt } from '../middlewares/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerBodySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const loginBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const googleAuthBodySchema = z
  .object({
    credential: z.string().optional(),
    accessToken: z.string().optional(),
  })
  .refine((data) => Boolean(data.credential || data.accessToken), {
    message: 'Google ID Token (credential) ou accessToken é obrigatório',
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

  // POST /auth/google (Validação Oficial via google-auth-library)
  app.post('/auth/google', async (request, reply) => {
    const parseResult = googleAuthBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Token de credencial do Google não fornecido ou inválido.',
        issues: parseResult.error.format(),
      });
    }

    const { credential, accessToken } = parseResult.data;

    try {
      let email: string;
      let name: string;
      let googleId: string;
      let avatarUrl: string | null | undefined;

      if (credential) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Falha ao validar as informações do usuário junto ao Google.',
          });
        }

        email = payload.email;
        name = payload.name || 'Usuário Google';
        googleId = payload.sub;
        avatarUrl = payload.picture;
      } else if (accessToken) {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Token Google OAuth2 inválido ou expirado.',
          });
        }

        const data = (await res.json()) as {
          sub: string;
          email: string;
          name?: string;
          picture?: string;
        };

        if (!data.email) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'E-mail não encontrado no perfil do Google.',
          });
        }

        email = data.email;
        name = data.name || 'Usuário Google';
        googleId = data.sub;
        avatarUrl = data.picture;
      } else {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Token do Google ausente.',
        });
      }

      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { googleId }],
        },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: avatarUrl || user.avatarUrl,
            name: user.name || name || 'Usuário Google',
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: name || 'Usuário Google',
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
    } catch (err: any) {
      request.log.error(err);
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token Google OAuth2 inválido ou expirado.',
      });
    }
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
