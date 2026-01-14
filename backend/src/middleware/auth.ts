import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { verifyToken } from '../lib/supabase.js';
import { Errors } from '@open-brochure/shared';

// Extend FastifyRequest with user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
    };
  }
}

/**
 * Extract JWT from Authorization header
 */
function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Authentication middleware - requires valid JWT
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = extractToken(request);

  if (!token) {
    throw Errors.unauthorized('Missing authorization token');
  }

  const user = await verifyToken(token);

  if (!user) {
    throw Errors.unauthorized('Invalid or expired token');
  }

  request.user = {
    id: user.id,
    email: user.email,
  };
}

/**
 * Optional authentication - attaches user if token present, continues if not
 */
export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  const token = extractToken(request);

  if (!token) {
    return;
  }

  const user = await verifyToken(token);

  if (user) {
    request.user = {
      id: user.id,
      email: user.email,
    };
  }
}

/**
 * Auth plugin for route registration
 */
export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);
};
