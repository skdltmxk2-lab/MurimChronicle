import type { MockUser } from "@/types/auth";

export interface IAuthRepository {
  getCurrentUser(): Promise<MockUser | null>;
  registerStudent(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ ok: true; user: MockUser } | { ok: false; message: string }>;
  loginStudent(params: {
    email: string;
    password: string;
  }): Promise<{ ok: true; user: MockUser } | { ok: false; message: string }>;
  loginAdmin(password: string): MockUser | null;
  logout(): Promise<void>;
}
