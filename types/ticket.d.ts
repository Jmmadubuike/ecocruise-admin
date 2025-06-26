// types/ticket.d.ts or in your component file
export interface Ticket {
  _id: string;
  user?: {
    name: string;
    email?: string;
    // other user properties
  };
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  updatedAt?: string;
  // add other ticket properties you use
}