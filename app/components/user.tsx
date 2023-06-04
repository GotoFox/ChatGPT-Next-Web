import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./user.module.scss";
import {
  PostChangePassword,
  PostInvitationRecords,
  PostUser,
} from "../http/user";
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

import { IconButton } from "./button";
import { useUpdateStore, useAppConfig } from "../store";

import Locale from "../locales";
import { copyToClipboard } from "../utils";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import DeleteIcon from "@/app/icons/delete.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

export function Users() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const user = JSON.parse(localStorage.getItem("access_user") as string);
  const [USER, setUSER] = useState({});

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [loading, setLoading] = useState(true); // 添加 loading 状态
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [showInvitationRecordsModal, setShowInvitationRecordsModal] =
    useState(false);
  const [subTitleInfo, setSubTitleInfo] = useState("");
  const [cycleText, setCycleText] = useState("");
  const [expireText, setExpireText] = useState("");

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
        setUSER((res as any).user);
        let limit = (res as any)?.user?.current_limit;
        let maxLimit = (res as any)?.user?.max_limit;
        let subtitle = "";

        if (limit === -1 && maxLimit === -1) {
          subtitle = "今日剩余 不限 次对话，每日总额 不限 次对话";
        } else if (limit === -1) {
          subtitle = `今日剩余 不限 次对话，每日总额 ${maxLimit} 次对话`;
        } else if (maxLimit === -1) {
          subtitle = `今日剩余 ${limit} 次对话，每日总额 不限 次对话`;
        } else {
          subtitle = `今日剩余 ${limit} 次对话，每日总额 ${maxLimit} 次对话`;
        }
        setSubTitleInfo(subtitle);

        const planName = (res as any).user?.plan?.name;
        const cycleText = (res as any).user?.plan?.cycleText;
        const cycleTextInfo =
          planName && cycleText ? `${planName}（${cycleText}）` : "未开通";
        setCycleText(cycleTextInfo);

        const expireTextInfo = (res as any).user?.plan?.expire
          ? `到期时间：${(res as any).user?.plan?.expire}`
          : "";
        setExpireText(expireTextInfo);
      } else {
        handleNavigationError();
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
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
    (async () => {
      await ClickUser();
    })();
  }, []);

  if (loading) {
    // 如果 loading 为 true，则显示 Loading 组件
    return <Loading />;
  }

  const handleSavePassword = () => {
    // 保存密码逻辑
    console.log("saving password");
    setShowEditPasswordModal(false);
  };

  const handleCheck = async () => {
    setExpireText("正在检查...");
    setSubTitleInfo("正在检查...");
    try {
      const params = { username: user.username };
      const res = await PostUser(params);
      if (res.status === 200) {
        let limit = (res as any)?.user?.current_limit;
        let maxLimit = (res as any)?.user?.max_limit;
        let subtitle = "";

        if (limit === -1 && maxLimit === -1) {
          subtitle = "今日剩余 不限 次对话，每日总额 不限 次对话";
        } else if (limit === -1) {
          subtitle = `今日剩余 不限 次对话，每日总额 ${maxLimit} 次对话`;
        } else if (maxLimit === -1) {
          subtitle = `今日剩余 ${limit} 次对话，每日总额 不限 次对话`;
        } else {
          subtitle = `今日剩余 ${limit} 次对话，每日总额 ${maxLimit} 次对话`;
        }
        setSubTitleInfo(subtitle);

        const planName = (res as any).user?.plan?.name;
        const cycleText = (res as any).user?.plan?.cycleText;
        const cycleTextInfo =
          planName && cycleText ? `${planName}（${cycleText}）` : "未开通";
        setCycleText(cycleTextInfo);

        const expireTextInfo = (res as any).user?.plan?.expire
          ? `到期时间：${(res as any).user?.plan?.expire}`
          : "";
        setExpireText(expireTextInfo);
      } else {
        setSubTitleInfo("检查失败，请稍后再试");
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      setSubTitleInfo("检查失败，请稍后再试");
    }
  };

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
            <div className={styles.font12}>
              {USER && (USER as any).username}
            </div>
          </ListItem>
          <ListItem title={"邮箱"}>
            <div className={styles.font12}>{USER && (USER as any).email}</div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"登录密码"} subTitle={"修改账号登录密码"}>
            <div className={styles.font12}>
              {" "}
              <IconButton
                icon={<EditIcon />}
                text={"修改"}
                onClick={() => setShowEditPasswordModal(true)}
              />
            </div>
          </ListItem>
        </List>
        <List>
          <ListItem title={"当前套餐"} subTitle={expireText}>
            <div className={styles.font12}>{cycleText}</div>
          </ListItem>

          <ListItem title={"套餐查询"} subTitle={subTitleInfo}>
            <div className={styles.font12}>
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={"重新检查"}
                onClick={handleCheck}
              />
            </div>
          </ListItem>
          <ListItem title={"所有套餐"} subTitle={""}>
            <div className={styles.font12}>
              {" "}
              <IconButton text={"购买"} onClick={() => navigate(Path.Plan)} />
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem
            title={"邀请码"}
            subTitle={"邀请新用户注册将获得 10 次对话奖励"}
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
                onClick={() => setShowInvitationRecordsModal(true)}
              />
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"快捷登录"} subTitle={"已绑定的第三方平台"}>
            <div className={styles["fixBox"]}>
              <div className={styles["user-left"]}>
                <IconButton icon={<QqIcon />} shadow />
              </div>
              <div className={styles["user-left"]}>
                <IconButton icon={<WeiXinIcon />} shadow />
              </div>
              <div className={styles["user-left"]}>
                <IconButton icon={<GithubIcon />} shadow />
              </div>
              <div className={styles["user-left"]}>
                <IconButton icon={<WeiboIcon />} shadow />
              </div>
            </div>
          </ListItem>
        </List>

        <List>
          <ListItem title={"退出登录"}>
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
      {showEditPasswordModal && (
        <EditPasswordModal onClose={() => setShowEditPasswordModal(false)} />
      )}
      {showInvitationRecordsModal && (
        <InvitationRecordsModal
          onClose={() => setShowInvitationRecordsModal(false)}
        />
      )}
    </ErrorBoundary>
  );
}

function EditPasswordModal(props: { onClose?: () => void }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("access_user") as string);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="modal-mask">
      <Modal
        title={"修改密码"}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            disabled={loading}
            onClick={async () => {
              // 修改密码逻辑
              if (!oldPassword || !newPassword) {
                showToast("当前密码和新密码不能为空");
                return;
              }
              try {
                setLoading(true);
                const { username } = user;
                const params = {
                  [username.includes("@") ? "email" : "username"]: username,
                  oldPassword: oldPassword,
                  newPassword: newPassword,
                };
                let res = await PostChangePassword(params);
                if (res.status === 200) {
                  showToast(res && (res as any).msg);
                  props.onClose?.();
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("access_user");
                  navigate(Path.Home);
                } else {
                  showToast(res && (res as any).msg);
                }
              } catch (error) {
                const errorMessage =
                  (error as any).response?.data?.msg ?? "网络请求出错，请重试";
                showToast(errorMessage);
              } finally {
                setLoading(false);
              }
            }}
            icon={<AddIcon />}
            bordered
            text={"确认修改"}
          />,
          <IconButton
            key="cancel"
            bordered
            text={"取消"}
            icon={<DeleteIcon />}
            onClick={() => {
              props.onClose?.();
            }}
          />,
        ]}
      >
        <div className={styles["edit-password-modal"]}>
          <div className={styles["edit-password-filter"]}>
            <input
              className={styles["edit-password-input"]}
              type="text"
              placeholder={"当前密码"}
              value={oldPassword}
              onInput={(e) => setOldPassword(e.currentTarget.value)}
            />
            <IconButton
              bordered
              onClick={() => setOldPassword("")}
              icon={<ClearIcon />}
            />
          </div>
          <div className={styles["edit-password-filter"]}>
            <input
              className={styles["edit-password-input"]}
              type="text"
              placeholder={"新密码"}
              value={newPassword}
              onInput={(e) => setNewPassword(e.currentTarget.value)}
            />
            <IconButton
              bordered
              onClick={() => setNewPassword("")}
              icon={<ClearIcon />}
            />
          </div>
        </div>
        <span className={styles["user-center-loading"]}>
          {loading && <LoadingIcon />}
        </span>
      </Modal>
    </div>
  );
}

function InvitationRecordsModal(props: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("access_user") as string);
  const [invitationRecordsData, setInvitationRecordsData] = useState<{
    list: any[];
  }>({ list: [] });

  useEffect(() => {
    (async () => {
      await doClickInvitationRecords();
    })();
  }, []);

  // 查询邀请记录
  async function doClickInvitationRecords() {
    try {
      setLoading(true);
      const { username, invite_code } = user;
      const params = { username, invite_code };

      let res = await PostInvitationRecords(params);
      if (res.status === 200) {
        setInvitationRecordsData(res.data);
        setLoading(false);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-mask">
      <Modal
        title={"邀请记录"}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="cancel"
            bordered
            text={"关闭"}
            icon={<DeleteIcon />}
            onClick={() => {
              props.onClose?.();
            }}
          />,
        ]}
      >
        <div className={styles["invitationRecords-model-box"]}>
          <div className={styles["invitationRecords-model"]}>
            <div className={styles["model-list"]}>
              <div className={styles["model-item"]}>
                <div className={styles["header"]}>
                  <div className={styles["title"]}>用户名</div>
                  <div className={styles["title"]}>邮箱</div>
                  <div className={styles["title"]}>注册时间</div>
                </div>
              </div>

              {!loading ? (
                <div>
                  {invitationRecordsData &&
                  invitationRecordsData.list &&
                  invitationRecordsData.list.length > 0 ? (
                    invitationRecordsData.list.map(
                      (
                        item: {
                          username: string;
                          email: string;
                          create_time: string;
                        },
                        index: number,
                      ) => (
                        <div key={index} className={styles["model-item"]}>
                          <div className={styles["header"]}>
                            <div className={styles["title-text"]}>
                              {item.username}
                            </div>
                            <div className={styles["title-text"]}>
                              {item.email}
                            </div>
                            <div className={styles["title-text"]}>
                              {item.create_time}
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className={styles["model-item"]}>
                      <div className={styles["header"]}>
                        <div className={styles["title-text"]}>暂无邀请记录</div>
                        <div className={styles["title-text"]}></div>
                        <div className={styles["title-text"]}></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles["loading-center"]}>
                  {loading && <LoadingIcon />}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
