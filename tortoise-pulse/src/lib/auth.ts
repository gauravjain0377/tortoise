import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload, Role } from '@/types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'tortoise-pulse-dev-secret-change-in-production'
);

const EXPIRES_IN = '7d';

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return {
    userId: payload.userId as string,
    role: payload.role as Role,
    orgId: payload.orgId as string,
  };
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
