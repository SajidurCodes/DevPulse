export type TUserRole = "contributor" | "maintainer";

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: TUserRole;
}