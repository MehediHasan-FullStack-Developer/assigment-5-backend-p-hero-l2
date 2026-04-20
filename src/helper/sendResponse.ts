import { Response } from "express";
import { env } from "../config/envConfig";

type CookieOptionsType = {
  token?: string;
  refreshToken?: string;
  sessionToken?: string;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  cookies?: CookieOptionsType,
) => {
  if (cookies?.token) {
    res.cookie("token", cookies.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: env.NODE_ENV ? "none" : "lax",
    });
  }

  if (cookies?.refreshToken) {
    res.cookie("refreshToken", cookies.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: env.NODE_ENV ? "none" : "lax",
    });
  }

  if (cookies?.sessionToken) {
    res.cookie("better-auth.session_token", cookies.sessionToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: env.NODE_ENV ? "none" : "lax",
    });
  }

  res.status(statusCode).json({
    success: true,
    message,
    cookies,
    data,
  });
};
