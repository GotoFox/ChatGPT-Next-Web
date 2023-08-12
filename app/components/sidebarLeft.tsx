import { useEffect, useRef } from "react";
import { useState } from "react";

import styles from "./sidebarLeft.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import UserIcon from "../icons/user.svg";
import RemindIcon from "../icons/remind.svg";
import ChatIcon from "../icons/chat.svg";
import MessageOneIcon from "../icons/message-one.svg";
import DragIcon from "../icons/drag.svg";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import { AuthModel } from "./authModel";
import { AnnouncementModel } from "./AnnouncementModel";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "./ui-lib";

export function SideBarLeft(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const navigate = useNavigate();
  const location = useLocation();
  const isUser = location.pathname === Path.User;
  const [showModal, setShowModal] = useState(false);
  const [showAnnouncemnentModal, setShowAnnouncemnentModal] = useState(false);
  const isMobileScreen = useMobileScreen();
  const [selectedPath, setSelectedPath] = useState("");

  const config = useAppConfig();
  const token = localStorage.getItem("access_token");

  function checkLoginTimeAndToken() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      const isUser = location.pathname === Path.User;
      if (isUser) {
        navigate(Path.Home);
      }
      setShowModal(true);
      return false;
    }

    const loginTime = JSON.parse(localStorage.getItem("access_user") as string);
    if (loginTime) {
      const loginTimestamp = new Date(loginTime.login_time).getTime();
      const twelveHoursLater = loginTimestamp + 12 * 60 * 60 * 1000; // 12个小时
      const currentTime = new Date().getTime();
      if (currentTime > twelveHoursLater) {
        const isUser = location.pathname === Path.User;
        if (isUser) {
          navigate(Path.Home);
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("access_user");
        setShowModal(true);
        return false;
      }
    }
    return true;
  }

  function handleMenuItemClick(path: any) {
    setSelectedPath(path);
    navigate(path);
  }

  useEffect(() => {
    setSelectedPath(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${styles["narrow-sidebar"]}`}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          TryChat
        </div>
        <div className={styles["sidebar-sub-title"]}>简单易用的智能AI助手</div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={""}
          className={styles["sidebar-bar-button"]}
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={""}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div className={styles["separator"]}>
        <hr className={styles["horizontalLine"]} />
      </div>

      <div className={styles["sidebar-body"]}>
        <div
          onClick={() => handleMenuItemClick(Path.Chat)}
          className={`${styles["chat-item"]} ${
            selectedPath === Path.Chat || selectedPath === Path.Home
              ? styles["chat-item-selected"]
              : ""
          }`}
        >
          <MessageOneIcon />
        </div>
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<RemindIcon />}
              shadow
              onClick={async () => {
                setShowAnnouncemnentModal(true);
              }}
            />
            <AnnouncementModel
              showAnnouncemnentModal={showAnnouncemnentModal}
              setShowAnnouncemnentModal={setShowAnnouncemnentModal}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<UserIcon />}
              shadow
              onClick={async () => {
                if (checkLoginTimeAndToken()) {
                  navigate(Path.User);
                }
              }}
            />
            <AuthModel showModal={showModal} setShowModal={setShowModal} />
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={""}
            onClick={() => {
              if (checkLoginTimeAndToken()) {
                if (config.dontShowMaskSplashScreen) {
                  chatStore.newSession();
                  navigate(Path.Chat);
                } else {
                  navigate(Path.NewChat);
                }
              }
            }}
            shadow
          />
        </div>
      </div>
    </div>
  );
}
