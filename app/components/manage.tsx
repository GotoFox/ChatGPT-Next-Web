import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./manage.module.scss";
import {
  PostUserListAll,
  PostUserPayListAll,
  PostUserBanListAll,
  PostRecordCount,
  PostUserCount,
} from "../http/manage";
import { Loading } from "./home";

import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  showToast,
} from "./ui-lib";

import { IconButton } from "./button";
import { useUpdateStore, useAppConfig } from "../store";

import Locale from "../locales";
import { copyToClipboard } from "../utils";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@/app/icons/close.svg";
import LeftIcon from "@/app/icons/left.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import { Avatar, AvatarPicker } from "@/app/components/emoji";
import ChatSettingsIcon from "@/app/icons/chat-settings.svg";
import { UserListAll } from "@/app/components/userListAll";
import { RecordListAll } from "@/app/components/recordListAll";

export function Manage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [USER, setUSER] = useState({
    username: undefined,
    role: undefined,
    email: undefined,
  });
  const [manageCount, setManageCount] = useState({
    all: 0,
    pay: 0,
    banned: 0,
  });
  const [recordCount, setRecordCount] = useState({
    all: 0,
    paid: 0,
    notPaid: 0,
  });

  useEffect(() => {
    const access_user = localStorage.getItem("access_user");
    const accessUser = access_user ? JSON.parse(access_user) : "null";
    setUSER(accessUser);

    if (accessUser.role !== "manage") {
      navigate(Path.Home);
    }

    ClickManage();
  }, []);

  async function ClickManage() {
    try {
      setLoading(true);
      let params = { page: 1, pageSize: 99999 };
      const [UserCount, RecordCount] = await Promise.all([
        PostUserCount(params),
        PostRecordCount(params),
      ]);

      if (RecordCount.status === 200 && UserCount.status === 200) {
        setRecordCount(RecordCount.data);
        setManageCount(UserCount.data);
      } else {
        navigate(Path.Home);
      }
    } catch (error) {
      navigate(Path.Home);
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      console.error(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">管理中心</div>
          <div className="window-header-sub-title"></div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<LeftIcon />}
              text={Locale.NewChat.Return}
              onClick={() => navigate(-1)}
            ></IconButton>
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem title={"账号"}>
            <div className={styles.font12}>{USER.username}</div>
          </ListItem>
          <ListItem title={"邮箱"}>
            <div className={styles.font12}>{USER.email}</div>
          </ListItem>
          <ListItem title={"角色"}>
            <div className={styles.font12}>
              {USER.role === "manage" ? "管理员" : "用户"}
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"注册用户"}>
            <div className={styles.font12}>{manageCount?.all}</div>
          </ListItem>
          <ListItem title={"付费用户"}>
            <div className={styles.font12}>{manageCount?.pay}</div>
          </ListItem>
          <ListItem title={"封禁用户"}>
            <div className={styles.font12}>{manageCount?.banned}</div>
          </ListItem>
          <ListItem title={"所有用户"}>
            <div className={styles.font12}>
              <IconButton
                text={"立即查询"}
                onClick={() => navigate(Path.UserListAll)}
              />
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"订单记录"}>
            <div className={styles.font12}>{recordCount?.all}</div>
          </ListItem>
          <ListItem title={"已支付订单"}>
            <div className={styles.font12}>{recordCount?.paid}</div>
          </ListItem>
          <ListItem title={"未支付订单"}>
            <div className={styles.font12}>{recordCount?.notPaid}</div>
          </ListItem>
          <ListItem title={"所有订单"}>
            <div className={styles.font12}>
              <IconButton
                text={"立即查询"}
                onClick={() => navigate(Path.RecordListAll)}
              />
            </div>
          </ListItem>
        </List>

        <div className={styles["loadingCenter"]}>
          {loading && <LoadingIcon />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
