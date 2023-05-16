import React, { useEffect, useState } from "react";
import { Modal, showToast } from "./ui-lib";
import { IconButton } from "./button";
import styles from "./authModel.module.scss";
import DeleteIcon from "@/app/icons/delete.svg";
import ClearIcon from "../icons/clear.svg";
import LoginIcon from "../icons/login.svg";
import LoadingIcon from "../icons/three-dots.svg";
import ReloadIcon from "../icons/reload.svg";
import { Path } from "@/app/constant";
import {
  PostLogin,
  PostRegister,
  PostSendCode,
  PostUser,
} from "@/app/http/user";
import { useNavigate } from "react-router-dom";
import Locale from "../locales";

export function AuthModel(props: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecked, setCheckbox] = useState(false);
  const navigate = useNavigate();
  const [user, setUserInput] = useState({
    username: "",
    password: "",
    email: "",
    inviteCode: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const accountUser = JSON.parse(
    localStorage.getItem("account_user") ?? "null",
  );
  const [countdown, setCountdown] = useState(0); // 倒计时时间
  const [disabled, setDisabled] = useState(false); // 按钮是否可点击

  useEffect(() => {
    setUserInput({
      username: "",
      password: "",
      email: "",
      inviteCode: "",
      code: "",
    });
  }, [props.showModal]);

  useEffect(() => {
    setUserInput({
      username: "",
      password: "",
      email: "",
      inviteCode: "",
      code: "",
    });

    if (!isRegistering) {
      if (accountUser) {
        setUserInput({
          username: accountUser.username,
          password: accountUser.password,
          email: "",
          inviteCode: "",
          code: "",
        });
        setCheckbox(true);
      }
    }
  }, [props.showModal]);

  async function loginSubmit() {
    if (!user.username || !user.password) {
      showToast(Locale.authModel.Toast.upCannotBeEmpty);
      return;
    }
    try {
      setLoading(true);
      const { username, password } = user;
      const params = {
        [username.includes("@") ? "email" : "username"]: username,
        password,
      };

      let res = await PostLogin(params);
      if (res.status === 200) {
        showToast(res && (res as any).msg);
        localStorage.setItem("access_token", res && (res as any).token);
        localStorage.setItem(
          "access_user",
          JSON.stringify(res && (res as any).user),
        );
        if (isChecked) {
          let account_user = {
            username: user.username,
            password: user.password,
          };
          localStorage.setItem("account_user", JSON.stringify(account_user));
        } else {
          localStorage.removeItem("account_user");
        }
        props.setShowModal(false);
        setIsRegistering(false);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? Locale.authModel.Toast.error;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function registerSubmit() {
    const { username, email, password, inviteCode, code } = user;
    if (!username || !email || !password) {
      showToast(Locale.authModel.Toast.uepCannotBeEmpty);
      return;
    }
    if (!inviteCode) {
      showToast(Locale.authModel.Toast.invitationCodeCannotBeEmpty);
      return;
    }
    if (!/^[a-zA-Z0-9]{1,30}$/.test(user.username)) {
      showToast(Locale.authModel.Toast.usernameRestrictions);
      return;
    }
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      showToast(Locale.authModel.Toast.emailVerification);
      return;
    }
    if (!code) {
      showToast("邮箱验证码不能为空");
      return;
    }

    try {
      setLoading(true);
      let res = await PostRegister(user);
      if (res.status === 200) {
        showToast(res && (res as any).msg);
        setIsRegistering(false);
        setCountdown(0);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? Locale.authModel.Toast.error;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // 点击获取验证码按钮
  const handleGetCode = async () => {
    if (!user.email) {
      showToast("邮箱不能为空");
      return;
    }
    try {
      setLoading(true);
      let params = { email: user.email };
      let res = await PostSendCode(params);
      if (res.status === 200) {
        setCountdown(90);
        setDisabled(true);
        showToast(res && (res as any).msg);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? Locale.authModel.Toast.error;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 倒计时结束
  const handleCountdownEnd = () => {
    setCountdown(0);
    setDisabled(false);
  };

  // 每秒钟减少倒计时时间
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      console.log(countdown, "190");
    } else {
      handleCountdownEnd();
      console.log(countdown, "countdown193");
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  let Title = isRegistering
    ? Locale.authModel.register
    : Locale.authModel.login;

  return (
    <div>
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={Title}
            onClose={() => {
              props.setShowModal(false);
              setIsRegistering(false);
            }}
            actions={[
              <IconButton
                key="confirm"
                bordered
                icon={<LoginIcon />}
                text={
                  isRegistering
                    ? Locale.authModel.signUpNow
                    : Locale.authModel.logInNow
                }
                onClick={isRegistering ? registerSubmit : loginSubmit}
                disabled={loading}
              />,
              <IconButton
                key="cancel"
                bordered
                text={Locale.authModel.cancel}
                icon={<DeleteIcon />}
                onClick={() => {
                  props.setShowModal(false);
                  setIsRegistering(false);
                }}
                // disabled={loading}
              />,
            ]}
          >
            <div>
              <div>
                {/* 登录 */}
                {!isRegistering && (
                  <div className={styles["auth-modal"]}>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.userName}
                      </div>
                      <input
                        type="text"
                        value={user.username}
                        className={styles["auth-input"]}
                        placeholder={Locale.authModel.Toast.pleaseEnterUe}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            username: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() => setUserInput({ ...user, username: "" })}
                        icon={<ClearIcon />}
                      />
                    </div>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.password}
                      </div>
                      <input
                        type="password"
                        value={user.password}
                        className={styles["auth-input"]}
                        placeholder={Locale.authModel.Toast.pleaseEnterPwd}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            password: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() => setUserInput({ ...user, password: "" })}
                        icon={<ClearIcon />}
                      />
                    </div>
                    {!isRegistering && (
                      <div className={styles["auth-writing"]}>
                        <span
                          className={styles["auth-font"]}
                          onClick={() => {
                            setIsRegistering(true);
                            setUserInput({
                              username: "",
                              password: "",
                              email: "",
                              inviteCode: "",
                              code: "",
                            });
                          }}
                        >
                          {Locale.authModel.noUser}
                        </span>
                        <span className={styles["auth-loading"]}>
                          {loading && <LoadingIcon />}
                        </span>
                        <span
                          className={styles["auth-font-no"]}
                          onClick={() => {
                            setCheckbox(!isChecked);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                          />
                          <label>{Locale.authModel.rememberPsd}</label>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 注册 */}
                {isRegistering && (
                  <div className={styles["auth-modal"]}>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.userName}
                      </div>
                      <input
                        type="text"
                        value={user.username}
                        className={styles["auth-input"]}
                        placeholder={Locale.authModel.Toast.pleaseEnterUser}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            username: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() => setUserInput({ ...user, username: "" })}
                        icon={<ClearIcon />}
                      />
                    </div>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.email}
                      </div>
                      <input
                        type="text"
                        value={user.email}
                        className={styles["auth-input-email"]}
                        placeholder={Locale.authModel.Toast.pleaseEnterEmail}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            email: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        value={user.code}
                        className={styles["auth-input-code"]}
                        placeholder={"请输入邮箱验证码"}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            code: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        className={styles["auth-getCode"]}
                        text={
                          countdown > 0 ? `${countdown}秒后重试` : "获取验证码"
                        }
                        onClick={handleGetCode}
                        icon={<ReloadIcon />}
                        disabled={disabled}
                      />
                      <IconButton
                        bordered
                        onClick={() =>
                          setUserInput({ ...user, email: "", code: "" })
                        }
                        icon={<ClearIcon />}
                      />
                    </div>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.password}
                      </div>
                      <input
                        type="password"
                        value={user.password}
                        className={styles["auth-input"]}
                        placeholder={Locale.authModel.Toast.pleaseEnterPwd}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            password: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() => setUserInput({ ...user, password: "" })}
                        icon={<ClearIcon />}
                      />
                    </div>
                    <div className={styles["auth-filter"]}>
                      <div className={styles["auth-filter-title"]}>
                        {Locale.authModel.invitationCode}
                      </div>
                      <input
                        type="text"
                        value={user.inviteCode}
                        className={styles["auth-input"]}
                        placeholder={
                          Locale.authModel.Toast.pleaseEnterInvitationCode
                        }
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            inviteCode: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() =>
                          setUserInput({ ...user, inviteCode: "" })
                        }
                        icon={<ClearIcon />}
                      />
                    </div>
                    {isRegistering && (
                      <div className={styles["auth-writing"]}>
                        <span
                          className={styles["auth-font"]}
                          onClick={() => {
                            setIsRegistering(false);
                            setUserInput({
                              username: "",
                              password: "",
                              email: "",
                              inviteCode: "",
                              code: "",
                            });
                            if (isChecked) {
                              if (accountUser) {
                                setUserInput({
                                  username: accountUser.username,
                                  password: accountUser.password,
                                  email: "",
                                  inviteCode: "",
                                  code: "",
                                });
                              }
                            }
                          }}
                        >
                          {Locale.authModel.yesUser}
                        </span>
                        <span className={styles["auth-loading"]}>
                          {loading && <LoadingIcon />}
                        </span>
                        <span
                          className={styles["auth-font-no"]}
                          onClick={() => {
                            showToast(
                              Locale.authModel.Toast.getAnInvitationCode,
                            );
                          }}
                        >
                          <label>{Locale.authModel.getAnInvitationCode}</label>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
