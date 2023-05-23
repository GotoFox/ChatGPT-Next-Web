import { get, post } from "./request";

export const GetPlan = (data) => get("/api/plan", data);
