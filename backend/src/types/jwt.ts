import "@fastify/jwt";

export interface JwtPayload {
  sub: string;       // user_id
  email: string;
  role: string;
  portal_id: string;
  iat?: number;
  exp?: number;
}

export interface JwtDecoded {
  id: string;
  email: string;
  role: string;
  portal_id: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtDecoded;
  }
}
