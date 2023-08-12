import { useEffect, useRef } from "react";
import { useState } from "react";

import styles from "./home.module.scss";

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

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  console.log(isMobileScreen);
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;
  console.log(!isMobileScreen);
  console.log(config.sidebarWidth);
  console.log(MIN_SIDEBAR_WIDTH);
  console.log(!isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH);
  // const shouldNarrow = false;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);
  console.log(shouldNarrow);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const location = useLocation();
  const isUser = location.pathname === Path.User;
  const [showModal, setShowModal] = useState(false);
  const [showAnnouncemnentModal, setShowAnnouncemnentModal] = useState(false);
  const isMobileScreen = useMobileScreen();

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

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          TryChat
        </div>
        <div className={styles["sidebar-sub-title"]}>简单易用的智能AI助手</div>
      </div>

      {isMobileScreen && (
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<MaskIcon />}
            text={shouldNarrow ? undefined : Locale.Mask.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() =>
              navigate(Path.NewChat, { state: { fromHome: true } })
            }
            shadow
          />
          <IconButton
            icon={<PluginIcon />}
            text={shouldNarrow ? undefined : Locale.Plugin.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => showToast(Locale.WIP)}
            shadow
          />
        </div>
      )}

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      {isMobileScreen && (
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
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={shouldNarrow ? undefined : Locale.Home.NewChat}
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
      )}

      {/*<div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      >
        <DragIcon />
      </div>*/}
    </div>
  );
}
