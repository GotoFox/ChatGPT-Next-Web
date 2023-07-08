import { get, post } from "./request";

export const PostUserListAll = (data) => post("/api/manage/userLists", data);
export const PostUserPayListAll = (data) =>
  post("/api/manage/userPayLists", data);

export const PostUserBanListAll = (data) =>
  post("/api/manage/userBanLists", data);

export const PostUserSortListAll = (data) =>
  post("/api/manage/userSortLists", data);

export const PostUserBan = (data) => post("/api/manage/userBan", data);
