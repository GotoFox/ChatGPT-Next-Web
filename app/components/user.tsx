import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./user.module.scss";
import { PostUser } from "../http/user";

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

function formatVersionDate(t: string) {
  const d = new Date(+t);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("");
}
export function Users() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const resetConfig = config.reset;
  const chatStore = useChatStore();

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = formatVersionDate(updateStore.version);
  const remoteId = formatVersionDate(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log(
      "[Update] local version ",
      new Date(+updateStore.version).toLocaleString(),
    );
    console.log(
      "[Update] remote version ",
      new Date(+updateStore.remoteVersion).toLocaleString(),
    );
  }

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ClickUser() {
    let params = {
      username: "test",
    };
    try {
      let res = await PostUser(params);
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg;
      showToast(errorMessage);
    }
  }

  const user = JSON.parse(localStorage.getItem("access_user") ?? "null");

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
                onClick={() => checkUsage(true)}
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
