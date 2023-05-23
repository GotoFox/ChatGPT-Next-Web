import { get, post } from "../http/request";

export const PostUser = (data) => post("/api/user", data);
export const PostLogin = (data) => post("/api/login", data);
export const PostRegister = (data) => post("/api/register", data);
export const PostChangePassword = (data) => post("/api/changePassword", data);
export const PostInvitationRecords = (data) =>
  post("/api/invitationRecords", data);
export const PostSendCode = (data) => post("/api/sendCode", data);
export const PostSendResetPasswordCode = (data) =>
  post("/api/sendResetPasswordCode", data);
export const PostForgotPassword = (data) => post("/api/forgotPassword", data);
