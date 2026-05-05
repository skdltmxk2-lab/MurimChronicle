export type MockUserRole = "student" | "admin";

export type MockUser = {
  name: string;
  role: MockUserRole;
  email?: string;
};

export type StudentAccount = {
  username: string;
  password: string;
  name: string;
  createdAt: string;
};
