import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./user.module.scss";
import { PostUser } from "../http/user";
import { Loading } from "./home";

import ResetIcon from "../icons/reload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import QqIcon from "../icons/map/qq.svg";
import WeiXinIcon from "../icons/map/weixin.svg";
import GithubIcon from "../icons/map/github.svg";
import WeiboIcon from "../icons/map/weibo.svg";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  showToast,
} from "./ui-lib";
import { ModelConfigList } from "./model-config";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  useUpdateStore,
  useAccessStore,
  useAppConfig,
} from "../store";

import Locale, { AllLangs, changeLang, getLang } from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import { Path, UPDATE_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import UserIcon from "@/app/icons/user.svg";

export function Users() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const user = JSON.parse(localStorage.getItem("access_user") as string);

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [loading, setLoading] = useState(true); // 添加 loading 状态
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }
  async function ClickUser() {
    setLoading(true); // 开始请求时设置 loading 为 true
    const params = { username: user.username };
    try {
      const res = await PostUser(params);
      if (res.status === 200) {
        setLoading(false); // 成功返回时设置 loading 为 false
      } else {
        handleNavigationError();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg ?? "网络请求出错，请重试";
      console.error(errorMessage);
      showToast(errorMessage);
      setLoading(false); // 请求出错时设置 loading 为 false
      handleNavigationError();
    }
  }

  function handleNavigationError() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_user");
    navigate(Path.Home); // 跳转回 Home 页面
  }

  useEffect(() => {
    ClickUser(); // 页面渲染时自动请求用户信息
  }, []);

  if (loading) {
    // 如果 loading 为 true，则显示 Loading 组件
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {/*{Locale.Settings.Title}*/}
            用户中心
          </div>
          <div className="window-header-sub-title">
            {/*{Locale.Settings.SubTitle}*/}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>
          <ListItem title={"账号"}>
            <div className={styles.font12}>{user && user.username}</div>
          </ListItem>
          <ListItem title={"邮箱"}>
            <div className={styles.font12}>{user && user.email}</div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"登录密码"} subTitle={"修改账号登录密码"}>
            <div className={styles.font12}>
              {" "}
              <IconButton
                icon={<EditIcon />}
                text={"修改"}
                onClick={() => checkUsage(true)}
              />
            </div>
          </ListItem>
        </List>
        <List>
          <ListItem title={"当前套餐"} subTitle={"已开通的套餐"}>
            <div className={styles.font12}>免费计划</div>
          </ListItem>
          <ListItem
            title={"套餐查询"}
            subTitle={"当前已使用 1000 字符，套餐总额 10000 字符"}
          >
            <div className={styles.font12}>
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={"重新检查"}
                onClick={() => checkUsage(true)}
              />
            </div>
          </ListItem>
          <ListItem title={"所有套餐"} subTitle={""}>
            <div className={styles.font12}>
              {" "}
              <IconButton text={"升级"} onClick={() => checkUsage(true)} />
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem
            title={"邀请码"}
            subTitle={
              "邀请新用户注册将获得 500 字符，邀请用户和注册用户都将获得奖励"
            }
          >
            <div className={styles.font12}>
              {" "}
              <IconButton
                icon={<CopyIcon></CopyIcon>}
                text={"复制"}
                onClick={() => copyToClipboard(user?.invite_code)}
              />
            </div>
          </ListItem>
          <ListItem title={"邀请记录"} subTitle={""}>
            <div className={styles.font12}>
              {" "}
              <IconButton
                icon={<EyeIcon></EyeIcon>}
                text={"查看"}
                onClick={() => ClickUser()}
              />
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"快捷登录"} subTitle={"已绑定的第三方平台"}>
            <div className={styles.fixBox}>
              <div className={styles["sidebar-action"]}>
                <IconButton icon={<QqIcon />} shadow />
              </div>
              <div className={styles["sidebar-action"]}>
                <IconButton icon={<WeiXinIcon />} shadow />
              </div>
              <div className={styles["sidebar-action"]}>
                <IconButton icon={<GithubIcon />} shadow />
              </div>
              <div className={styles["sidebar-action"]}>
                <IconButton icon={<WeiboIcon />} shadow />
              </div>
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"退出"} subTitle={"退出登录的账号"}>
            <div className={styles.font12}>
              {" "}
              <IconButton
                text={"立即退出"}
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("access_user");
                  navigate(Path.Home);
                }}
              />
            </div>
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
