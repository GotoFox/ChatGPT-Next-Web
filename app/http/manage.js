import { get, post } from "./request";

export const PostUserListAll = (data) => post("/api/manage/userLists", data);
export const PostUserPayListAll = (data) =>
  post("/api/manage/userPayLists", data);

export const PostUserBanListAll = (data) =>
  post("/api/manage/userBanLists", data);

export const PostUserSortListAll = (data) =>
  post("/api/manage/userSortLists", data);

export const PostUserBan = (data) => post("/api/manage/userBan", data);

export const PostUserCount = (data) => post("/api/manage/userCount", data);

export const PostRecordCount = (data) => post("/api/manage/recordCount", data);
export const PostRecordListAll = (data) => post("/api/manage/recordList", data);
