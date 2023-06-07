import { get, post } from "./request";

export const GetPlan = (data) => get("/api/plan", data);
export const PostPurchase = (data) => post("/api/purchase", data);
export const PostUseCard = (data) => post("/api/useCard", data);
export const GetPlanAnnouncementList = (data) =>
  get("/api/planAnnouncementList", data);
export const PostOrderInquiry = (data) => get("/api/PostOrderInquiry", data);
export const GetOrderInquiry = (data) => get("/api/orderInquiry", data);
