// types/User.ts
export type Role = "admin" | "driver" | "user" | "customer";

export const Roles = {
  ADMIN: "admin",
  DRIVER: "driver",
  USER: "user",
  CUSTOMER: "customer",
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
