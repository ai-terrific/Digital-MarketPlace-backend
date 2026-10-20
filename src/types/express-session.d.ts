import 'express-session';

declare module 'express-session' {
  interface SessionData {
    email: string;
    region: string;
    city: string;
    browser: string;
    ip: string;
  }
}
