import React, { useEffect, useState } from "react";
import { Modal, showToast } from "./ui-lib";
import { IconButton } from "./button";
import styles from "./authModel.module.scss";
import DeleteIcon from "@/app/icons/delete.svg";
import ClearIcon from "../icons/clear.svg";
import LoginIcon from "../icons/login.svg";
import LoadingIcon from "../icons/three-dots.svg";
import { Path } from "@/app/constant";
import { PostLogin, PostRegister, PostUser } from "@/app/http/user";
import { useNavigate } from "react-router-dom";

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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserInput({
      username: "",
      password: "",
      email: "",
      inviteCode: "",
    });
  }, [props.showModal]);

  useEffect(() => {
    setUserInput({
      username: "",
      password: "",
      email: "",
      inviteCode: "",
    });

    const accountUser = JSON.parse(
      localStorage.getItem("account_user") ?? "null",
    );

    if (!isRegistering) {
      if (accountUser) {
        setUserInput({
          username: accountUser.username,
          password: accountUser.password,
          email: "",
          inviteCode: "",
        });
        setCheckbox(true);
      }
    }
  }, [props.showModal]);

  async function loginSubmit() {
    console.log(isChecked, "isChecked40");
    if (!user.username || !user.password) {
      showToast("用户名和密码不能为空");
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
        navigate(Path.User);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.msg;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function registerSubmit() {
    const { username, email, password, inviteCode } = user;
    if (!username || !email || !password) {
      showToast("用户名、邮箱和密码不能为空");
      return;
    }
    if (!inviteCode) {
      showToast("邀请码不能为空");
      return;
    }
    if (!/^[a-zA-Z0-9]{1,30}$/.test(user.username)) {
      showToast("用户名只能包含英文字母和数字，且长度不能超过30");
      return;
    }
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      showToast("请输入正确的邮箱地址");
      return;
    }

    try {
      setLoading(true);
      let res = await PostRegister(user);
      if (res.status === 200) {
        showToast(res && (res as any).msg);
        setIsRegistering(false);
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.msg;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  let Title = isRegistering ? "注册" : "登录";

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
                text={isRegistering ? "立即注册" : "立即登录"}
                onClick={isRegistering ? registerSubmit : loginSubmit}
                disabled={loading}
              />,
              <IconButton
                key="cancel"
                bordered
                text={"取消"}
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
                      <input
                        type="text"
                        value={user.username}
                        className={styles["auth-input"]}
                        placeholder={"请输入用户名/邮箱"}
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
                      <input
                        type="password"
                        value={user.password}
                        className={styles["auth-input"]}
                        placeholder={"请输入密码"}
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
                            });
                          }}
                        >
                          没有账号？注册账号&gt;&gt;
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
                          <label>记住密码</label>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 注册 */}
                {isRegistering && (
                  <div className={styles["auth-modal"]}>
                    <div className={styles["auth-filter"]}>
                      <input
                        type="text"
                        value={user.username}
                        className={styles["auth-input"]}
                        placeholder={"请输入用户名"}
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
                      <input
                        type="text"
                        value={user.email}
                        className={styles["auth-input"]}
                        placeholder={"请输入邮箱"}
                        onChange={(e) =>
                          setUserInput({
                            ...user,
                            email: e.target.value,
                          })
                        }
                      />
                      <IconButton
                        bordered
                        onClick={() => setUserInput({ ...user, email: "" })}
                        icon={<ClearIcon />}
                      />
                    </div>
                    <div className={styles["auth-filter"]}>
                      <input
                        type="password"
                        value={user.password}
                        className={styles["auth-input"]}
                        placeholder={"请输入密码"}
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
                      <input
                        type="text"
                        value={user.inviteCode}
                        className={styles["auth-input"]}
                        placeholder={"请输入邀请码"}
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
                            });
                          }}
                        >
                          已有账号，登录账号&gt;&gt;
                        </span>
                        <span className={styles["auth-loading"]}>
                          {loading && <LoadingIcon />}
                        </span>
                        <span
                          className={styles["auth-font-no"]}
                          onClick={() => {
                            showToast(
                              "邀请码机制已上线，请使用已注册用户分享的邀请码",
                            );
                          }}
                        >
                          <label>获取邀请码</label>
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
