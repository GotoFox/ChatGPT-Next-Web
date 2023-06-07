import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";
import QRCode from "qrcode.react";
import styles from "./plan.module.scss";
import CloseIcon from "../icons/close.svg";
import { IconButton } from "./button";
import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { List, ListItem, Modal, Popover, showToast } from "./ui-lib";
import AddIcon from "@/app/icons/add.svg";
import BuyIcon from "@/app/icons/buy.svg";
import TipsIcon from "@/app/icons/tips.svg";
import {
  GetPlan,
  GetPlanAnnouncementList,
  PostPurchase,
  PostUseCard,
} from "@/app/http/plan";
import LoadingIcon from "@/app/icons/three-dots.svg";
import { PostChangePassword, PostInvitationRecords } from "@/app/http/user";
import DeleteIcon from "@/app/icons/delete.svg";
import { Avatar, AvatarPicker } from "@/app/components/emoji";
import QqIcon from "@/app/icons/map/qq.svg";
import WeiXinIcon from "@/app/icons/map/weixin.svg";
import AlipayIcon from "@/app/icons/map/alipay.svg";
import GithubIcon from "@/app/icons/map/github.svg";
import WeiboIcon from "@/app/icons/map/weibo.svg";

export function Plan() {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState([]);
  const [planDataInfo, setPlanDataInfo] = useState([]);
  const [planAnnouncementInfo, setPlanAnnouncementInfo] = useState<{
    content: string;
  }>({ content: "" });
  const [loading, setLoading] = useState(false);
  const [loadingIn, setLoadingIn] = useState(false);
  const [card_no, setCard_no] = useState("");
  const user = JSON.parse(localStorage.getItem("access_user") as string);
  const [showInvitationRecordsModal, setShowInvitationRecordsModal] = useState(
    false,
  );
  const [currentPlan, setCurrentPlan] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [planRes, announcementRes] = await Promise.all([
          GetPlan(),
          GetPlanAnnouncementList(),
        ]);
        if (planRes.status === 200) {
          setPlanDataInfo(planRes.data);
          setPlanData(planRes.data.filter((item: any) => item.period === 1));
        } else {
          showToast(planRes && (planRes as any).msg);
        }
        if (announcementRes.status === 200) {
          setPlanAnnouncementInfo(
            announcementRes.data[announcementRes.data.length - 1],
          );
        } else {
          showToast(announcementRes && (announcementRes as any).msg);
        }
      } catch (error) {
        const errorMessage =
          (error as any).response?.data?.msg ?? "网络请求出错，请重试";
        showToast(errorMessage);
      } finally {
        setLoading(false); // 请求结束时设置 loading 为 false
      }
    }

    fetchData();
  }, []);

  // async function doPurchase(plan: PlanData) {
  //   setLoadingIn(true);
  //   try {
  //     let params = {
  //       username: user.username,
  //       planId: plan.id,
  //     };
  //     const res = await PostPurchase(params);
  //     showToast(res && (res as any).msg);
  //   } catch (error) {
  //     const errorMessage =
  //       (error as any).response?.data?.msg ?? Locale.authModel.Toast.error;
  //     showToast(errorMessage);
  //   } finally {
  //     setLoadingIn(false);
  //   }
  // }

  async function selectCycle(type: string) {
    if (type === "season") {
      setPlanData(planDataInfo.filter((item: any) => item.period === 3));
    } else if (type === "year") {
      setPlanData(planDataInfo.filter((item: any) => item.period === 12));
    } else {
      setPlanData(planDataInfo.filter((item: any) => item.period === 1));
    }
  }

  async function useCard() {
    if (!card_no) {
      showToast("卡密不能为空");
      return;
    }
    setLoadingIn(true);
    try {
      const params = {
        card_no: card_no,
        username: user.username,
      };
      const res = await PostUseCard(params);
      if (res.status === 200) {
        setCard_no("");
      }
      showToast(res && (res as any).msg);
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ||
        (error as any).response?.data ||
        Locale.authModel.Toast.error;
      showToast(errorMessage);
    } finally {
      setLoadingIn(false);
    }
  }

  async function goCard() {
    showToast("我们暂未指定销售平台，请耐心等待");
  }

  interface PlanData {
    code: string;
    cycleText: string;
    id: number;
    name: string;
    model: string;
    price: number;
    usage_limit: number;
  }

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {/*{Locale.Settings.Title}*/}
            套餐计划
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
      <div className={styles["plans"]}>
        <List>
          <div
            className={styles["plans_introduce"]}
            dangerouslySetInnerHTML={{ __html: planAnnouncementInfo.content }}
          ></div>
        </List>

        <div className={styles["plans_cami"]}>
          <div className={styles["cami_class"]}>
            <input
              className={styles["cami_input"]}
              type="text"
              value={card_no}
              placeholder={"请输入卡密"}
              onChange={(e) => setCard_no(e.target.value)}
            />
            <IconButton
              className={styles["cami_button"]}
              bordered
              text={"兑换"}
              disabled={loadingIn}
              onClick={useCard}
              icon={<AddIcon />}
            />
            <IconButton
              bordered
              onClick={goCard}
              text={"购买卡密"}
              icon={<BuyIcon />}
            />
          </div>
        </div>

        <div className={styles["plan_region"]}>
          <div className={styles["plan_region_text"]}>
            <TipsIcon className={styles["tips-icon"]} />
            <span> 不同的套餐次数可以累加</span>
          </div>
          <div className={styles["plan_cycle"]}>
            <span
              className={styles["text"]}
              onClick={() => {
                selectCycle("month");
              }}
            >
              月
            </span>
            <span> / </span>
            <span
              className={styles["text"]}
              onClick={() => {
                selectCycle("season");
              }}
            >
              季
            </span>
            <span> / </span>
            <span
              className={styles["text"]}
              onClick={() => {
                selectCycle("year");
              }}
            >
              年
            </span>
          </div>
        </div>
        {!loading && (
          <div className={styles["plans_all"]}>
            {planData &&
              planData.map((plan: PlanData) => (
                <div
                  className={
                    plan.code === "hot"
                      ? `${styles["plan"]} ${styles["plan_hot_act"]}`
                      : styles["plan"]
                  }
                  key={plan.id}
                >
                  {plan.code === "hot" ? (
                    <div className={styles["plan_hot"]}>限时特价</div>
                  ) : null}
                  <div className={styles["plan_title"]}>
                    <span>{plan.name}</span>
                  </div>
                  <div className={styles["plan_equity"]}>
                    <span>
                      每日 {plan.usage_limit === -1 ? "不限" : plan.usage_limit}{" "}
                      次对话，
                    </span>
                    <span>{plan.model}</span>
                  </div>
                  <p className={styles["plan_price"]}>
                    ￥
                    <span className={styles["plan_price_text"]}>
                      {plan.price}
                    </span>
                    <span className={styles["plan_price_text_cycle"]}>
                      {" "}
                      /{plan.cycleText}
                    </span>
                  </p>

                  {/*{!loadingIn && (
                    <div
                      className={styles["plan_button"]}
                      onClick={() => doPurchase(plan)}
                    >
                      立即购买
                    </div>
                  )}*/}

                  {!loadingIn && (
                    <div
                      className={styles["plan_button"]}
                      onClick={() => {
                        setShowInvitationRecordsModal(true);
                        setCurrentPlan(plan);
                      }}
                    >
                      立即购买
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        <div className={styles["plan-loadingIn"]}>
          <div className={styles["loading"]}>
            {loadingIn && <LoadingIcon />}
          </div>
        </div>

        <div className={styles["plan-loading"]}>
          <div className={styles["loading"]}>{loading && <LoadingIcon />}</div>
        </div>

        <div className={styles["plan_footer"]}>
          <div className={styles["plan_region"]}>
            <div>购买说明</div>
          </div>
          <div>
            <p>1、若购买付款之后套餐及关联权益未到账，请及时联系客服；</p>
            <p>
              2、购买即视为您同意《用户协议》，因产品特殊性，确认购买支付后不支持退款。
            </p>
          </div>
        </div>
      </div>
      {showInvitationRecordsModal && (
        <InvitationRecordsModal
          currentPlan={currentPlan}
          onClose={() => setShowInvitationRecordsModal(false)}
        />
      )}
    </ErrorBoundary>
  );
}

function InvitationRecordsModal(props: {
  currentPlan: any;
  onClose?: () => void;
}) {
  const { currentPlan, onClose } = props;
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("access_user") as string);
  const [qrCode, setQrCode] = useState("");
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_REACT_APP_BASE_URL_WS ?? "ws://localhost:8848";

  async function paymentCode(type: string) {
    setLoading(true);
    try {
      let params = {
        username: user.username,
        planId: currentPlan.id,
      };
      const res = await PostPurchase(params);
      if (res && (res as any).data) {
        setQrCode((res as any).data.qrCode);
        await checkTheStatusOfYourOrder((res as any).data.out_trade_no);
      }
      // showToast(res && (res as any).msg);
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ||
        (error as any).response?.data ||
        Locale.authModel.Toast.error;
      showToast(errorMessage);
      setQrCode("");
    } finally {
      setLoading(false);
    }
  }

  async function checkTheStatusOfYourOrder(data: string) {
    const ws = new WebSocket(API_BASE_URL, "protocolOne");
    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ out_trade_no: data, type: "orderInquiry" }));
    };
    await new Promise((resolve) => {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket received data: ", data);
        if (data.type === "orderInquiry" && data.payload.status === 200) {
          // 执行某一事件或赋值
          console.log("订单状态已更新");
          ws.close();
        } else {
          console.log("订单状态未更新，继续等待");
        }
      };
    });
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  return (
    <div className="modal-mask">
      <Modal
        title={"在线支付"}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            icon={<AddIcon />}
            bordered
            text={"支付完成"}
            onClick={() => {
              props.onClose?.();
            }}
          />,
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
        <div className={styles["plan_pay"]}>
          <List>
            <ListItem title={"支付渠道"}>
              <div className={styles["fixBox"]}>
                <div className={styles["plan_pay-left"]}>
                  <IconButton
                    icon={<WeiXinIcon />}
                    onClick={() => {
                      paymentCode("weixin");
                    }}
                    shadow
                  />
                </div>
                <div className={styles["plan_pay-left"]}>
                  <IconButton
                    icon={<AlipayIcon />}
                    onClick={() => {
                      paymentCode("alipay");
                    }}
                    shadow
                  />
                </div>
              </div>
            </ListItem>

            <ListItem title={"扫码支付"}>
              <div className={styles["fixBox_qr"]}>
                <div className={styles["fixBox_qr"]}>
                  {qrCode ? (
                    <QRCode value={qrCode} size={128} />
                  ) : (
                    <div>请选择上方的支付渠道</div>
                  )}
                </div>
              </div>
            </ListItem>
          </List>

          <div className={styles["plan_pay-loading-center"]}>
            {loading && <LoadingIcon />}
          </div>
        </div>
      </Modal>
    </div>
  );
}
