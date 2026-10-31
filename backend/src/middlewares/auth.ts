import { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente.',
    });
  }
}

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as { role?: string };
  if (!user || user.role !== 'ADMIN') {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Acesso restrito para administradores.',
    });
  }
}

