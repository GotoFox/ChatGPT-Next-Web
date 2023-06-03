import { get, post } from "./request";

export const GetPlan = (data) => get("/api/plan", data);
export const PostPurchase = (data) => post("/api/purchase", data);
export const PostUseCard = (data) => post("/api/useCard", data);
