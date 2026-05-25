import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { IUser } from "../user/user.interface";
import { sql } from "../../db";
import config from "../../config";

 

const signupUser = async (payload: IUser) => {
  const hashedPassword = await bcrypt.hash(payload.password,Number(config.bcrypt_salt_rounds));

  const result = await sql`
    INSERT INTO users(name,email,password_hash,role)
    VALUES(
      ${payload.name},
      ${payload.email},
      ${hashedPassword},
      ${payload.role}
    )
    RETURNING id,name,email,role,created_at,updated_at
  `;

  return result[0];



};

const loginUser = async (email: string, password: string) => {
    
  const users = await sql`
    SELECT * FROM users WHERE email=${email}
  `;


  const user = users[0];
  

  if (!user) {
    throw new Error("User not found");
  }

  const matched = await bcrypt.compare(password, user.password_hash);

  if (!matched) {
    throw new Error("Password incorrect");
  }

  const token = jwt.sign({
      id: user.id,
      name: user.name,
      role: user.role,
    },
    config.jwt_secret!,
    {
      expiresIn: Number(config.jwt_expires_in) || "2d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const AuthService = {
  signupUser,
  loginUser,
};