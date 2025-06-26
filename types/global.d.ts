// types/global.d.ts
declare global {
  interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
  }

  interface Ticket {
    _id: string;
    user?: {
      name: string;
    };
    // other properties
  }
}