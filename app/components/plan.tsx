import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";
import styles from "./plan.module.scss";
import CloseIcon from "../icons/close.svg";
import { IconButton } from "./button";
import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { List, ListItem, showToast } from "./ui-lib";
import AddIcon from "@/app/icons/add.svg";
import BuyIcon from "@/app/icons/buy.svg";
import TipsIcon from "@/app/icons/tips.svg";
import { GetPlan } from "@/app/http/plan";
import LoadingIcon from "@/app/icons/three-dots.svg";

export function Plan() {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getPlanData() {
      setLoading(true);
      try {
        const res = await GetPlan();
        if (res.status === 200) {
          setPlanData(res.data);
        } else {
          showToast(res && (res as any).msg);
        }
      } catch (error) {
        const errorMessage =
          (error as any).response?.data?.msg ?? "网络请求出错，请重试";
        showToast(errorMessage);
      } finally {
        setLoading(false); // 请求结束时设置 loading 为 false
      }
    }

    getPlanData();
  }, []);

  interface PlanData {
    code: string;
    id: number;
    name: string;
    price: number;
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
          <div className={styles["plans_introduce"]}>
            <div>套餐计划介绍：内测中，暂不支持购买</div>
          </div>
        </List>

        <div className={styles["plans_cami"]}>
          <div className={styles["cami_class"]}>
            <input
              className={styles["cami_input"]}
              type="text"
              placeholder={"请输入卡密"}
            />
            <IconButton
              className={styles["cami_button"]}
              bordered
              text={"兑换"}
              icon={<AddIcon />}
            />
            <IconButton bordered text={"购买卡密"} icon={<BuyIcon />} />
          </div>
        </div>

        <div className={styles["plan_region"]}>
          <div className={styles["plan_region_text"]}>
            <TipsIcon className={styles["tips-icon"]} />
            <span> 不同的套餐次数可以累加</span>
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
                  <div className={styles["plan_title"]}>{plan.name}</div>
                  <p className={styles["plan_price"]}>
                    ￥
                    <span className={styles["plan_price_text"]}>
                      {plan.price}
                    </span>
                  </p>
                  <div className={styles["plan_button"]}>立即购买</div>
                </div>
              ))}
          </div>
        )}

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
    </ErrorBoundary>
  );
}
