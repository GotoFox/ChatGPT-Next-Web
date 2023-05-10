import { get, post } from "../http/request";

export const PostUser = (data) => post("/api/user", data);
export const PostLogin = (data) => post("/api/login", data);
export const PostRegister = (data) => post("/api/register", data);
