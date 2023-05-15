import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";
import styles from "./plan.module.scss";
import CloseIcon from "../icons/close.svg";
import { IconButton } from "./button";
import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { List, ListItem } from "./ui-lib";
import AddIcon from "@/app/icons/add.svg";
import BuyIcon from "@/app/icons/buy.svg";
import TipsIcon from "@/app/icons/tips.svg";

export function Plan() {
  const navigate = useNavigate();

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
              text={"核销"}
              icon={<AddIcon />}
            />
            <IconButton bordered text={"购买卡密"} icon={<BuyIcon />} />
          </div>
        </div>

        <div className={styles["plan_region"]}>
          <div>字符包套餐</div>
          <div className={styles["plan_region_text"]}>
            <TipsIcon className={styles["tips-icon"]} />
            <span> 不同的套餐次数可以累加</span>
          </div>
        </div>
        <div className={styles["plans_all"]}>
          <div className={`${styles["plan"]} ${styles["plan_hot_act"]}`}>
            <div className={styles["plan_hot"]}>限时特价</div>
            <div className={styles["plan_title"]}>500万字符</div>
            <p className={styles["plan_price"]}>
              ￥<span className={styles["plan_price_text"]}>399</span>
            </p>
            <div className={styles["plan_button"]}>立即升级</div>
          </div>

          <div className={styles["plan"]}>
            <div className={styles["plan_title"]}>10万字符</div>
            <p className={styles["plan_price"]}>
              ￥<span className={styles["plan_price_text"]}>10</span>
            </p>
            <div className={styles["plan_button"]}>立即升级</div>
          </div>

          <div className={styles["plan"]}>
            <div className={styles["plan_title"]}>50万字符</div>
            <p className={styles["plan_price"]}>
              ￥<span className={styles["plan_price_text"]}>39</span>
            </p>
            <div className={styles["plan_button"]}>立即升级</div>
          </div>

          <div className={styles["plan"]}>
            <div className={styles["plan_title"]}>100万字符</div>
            <p className={styles["plan_price"]}>
              ￥<span className={styles["plan_price_text"]}>89</span>
            </p>
            <div className={styles["plan_button"]}>立即升级</div>
          </div>
        </div>

        <div className={styles["plan_footer"]}></div>
      </div>
    </ErrorBoundary>
  );
}
