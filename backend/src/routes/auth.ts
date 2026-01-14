import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import type { GetCurrentUserResponse } from '@open-brochure/shared';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/auth/me
   * Get current authenticated user's profile
   */
  fastify.get<{ Reply: GetCurrentUserResponse }>(
    '/me',
    { preHandler: requireAuth },
    async (request) => {
      const userId = request.user!.id;

      // Get user profile from our users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        // User doesn't exist in our table yet, create them
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);

        if (!authUser?.user) {
          throw new Error('User not found');
        }

        const provider = authUser.user.app_metadata?.provider || 'google';
        const newUser = {
          id: userId,
          email: authUser.user.email!,
          name: authUser.user.user_metadata?.full_name || null,
          avatar_url: authUser.user.user_metadata?.avatar_url || null,
          provider,
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          avatarUrl: createdUser.avatar_url,
          provider: createdUser.provider,
          createdAt: new Date(createdUser.created_at),
          lastLoginAt: createdUser.last_login_at ? new Date(createdUser.last_login_at) : null,
        };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        provider: user.provider,
        createdAt: new Date(user.created_at),
        lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
      };
    }
  );
};

export default authRoutes;
