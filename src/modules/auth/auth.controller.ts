import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";


const signup = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signupUser(req.body as any);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      data: result,
    });
  } catch (error : any) {
    
    console.error(error);
    sendResponse(res, {
        success: false,
        statusCode: 500,
        message: "An error occurred during signup",
        error: error.message
      });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const body = req.body as any;
    const result = await AuthService.loginUser(body.email, body.password);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: result,
    });
  } catch (error : any) {
    
    console.error("Login error:", error);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred during login",
      error : error.message
    });
  }
};

export const AuthController = {
  signup,
  login,
};
