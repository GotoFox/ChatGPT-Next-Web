import React, { useEffect, useState } from "react";
import { Modal, showToast } from "./ui-lib";
import { IconButton } from "./button";
import styles from "./authModel.module.scss";
import DeleteIcon from "@/app/icons/delete.svg";
import { Path } from "@/app/constant";
import { PostLogin, PostUser } from "@/app/http/user";

export function AuthModel(props: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  let Title = isRegistering ? "注册" : "登录";
  const [user, setUserInput] = useState({
    username: "",
    password: "",
    email: "",
  });

  useEffect(() => {
    setUserInput({
      username: "",
      password: "",
      email: "",
    });
  }, [props.showModal]);

  async function loginSubmit() {
    if (!user.username || !user.password) {
      showToast("用户名和密码不能为空");
      return;
    }
    console.log(user, "setUserInput");
    // showToast("登录成功");

    try {
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
      } else {
        showToast(res && (res as any).msg);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.msg;
      showToast(errorMessage);
    }

    props.setShowModal(false);
    setIsRegistering(false);
  }

  function registerSubmit() {
    const { username, email, password } = user;
    if (!username || !email || !password) {
      showToast("用户名、邮箱和密码不能为空");
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
    console.log(user, "setUserInput");
    showToast("注册成功");
    props.setShowModal(false);
    setIsRegistering(false);
  }

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
                text={isRegistering ? "立即注册" : "立即登录"}
                onClick={isRegistering ? registerSubmit : loginSubmit}
              />,
              <IconButton
                key="cancel"
                bordered
                text={"取消"}
                onClick={() => {
                  // cancel function
                  props.setShowModal(false);
                  setIsRegistering(false);
                  console.log("取消");
                }}
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
                        icon={<DeleteIcon />}
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
                        icon={<DeleteIcon />}
                      />
                    </div>
                    {!isRegistering && (
                      <div
                        className={styles["auth-font"]}
                        onClick={() => {
                          setIsRegistering(true);
                          setUserInput({
                            username: "",
                            password: "",
                            email: "",
                          });
                        }}
                      >
                        没有账号？注册账号&gt;&gt;
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
                        icon={<DeleteIcon />}
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
                        icon={<DeleteIcon />}
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
                        icon={<DeleteIcon />}
                      />
                    </div>
                    {isRegistering && (
                      <div
                        className={styles["auth-font"]}
                        onClick={() => {
                          setIsRegistering(false);
                          setUserInput({
                            username: "",
                            password: "",
                            email: "",
                          });
                        }}
                      >
                        已有账号，登录账号&gt;&gt;
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
