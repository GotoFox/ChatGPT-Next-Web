import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./recordListAll.module.scss";
import {
  PostChangePassword,
  PostInvitationRecords,
  PostUser,
} from "../http/user";
import { Loading } from "./home";

import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showConfirm,
  showToast,
} from "./ui-lib";

import { IconButton } from "./button";
import { useUpdateStore, useAppConfig } from "../store";

import Locale, { ALL_LANG_OPTIONS, AllLangs, Lang } from "../locales";
import { copyToClipboard } from "../utils";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@/app/icons/close.svg";
import LeftIcon from "@/app/icons/left.svg";
import { Avatar, AvatarPicker } from "@/app/components/emoji";
import ChatSettingsIcon from "@/app/icons/chat-settings.svg";
import AddIcon from "@/app/icons/add.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";
import LoginIcon from "../icons/login.svg";
import {
  PostRecordListAll,
  PostUserBan,
  PostUserBanListAll,
  PostUserListAll,
  PostUserPayListAll,
  PostUserSortListAll,
} from "@/app/http/manage";
import EyeIcon from "@/app/icons/eye.svg";
import EditIcon from "@/app/icons/edit.svg";
import DeleteIcon from "@/app/icons/delete.svg";
import { MaskAvatar } from "@/app/components/mask";
import LoadingIcon from "@/app/icons/three-dots.svg";

export function RecordListAll() {
  const navigate = useNavigate();
  const [filterLang, setFilterLang] = useState<Lang>();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<
    {
      username: any;
      status: Boolean;
      buyer_pay_amount: any;
      payment_type: any;
      trade_no: string;
      out_trade_no: any;
      id: any;
      subject: any;
    }[]
  >([]);

  useEffect(() => {
    PostUserAll(currentPage, "");
  }, [currentPage]);

  useEffect(() => {}, [filterLang]);

  const onSearch = (text: string) => {
    setSearchText(text);
  };

  const ClickSearch = () => {
    setCurrentPage(1); // Reset to the first page when performing a search
    PostUserAll(1, filterLang); // 将 filterLang 作为参数传递给 PostUserAll 函数
  };

  async function PostUserAll(page: any, sortField: any) {
    console.log(searchText, 90);
    console.log(sortField, 91);
    try {
      setLoading(true);
      const pageSize = 10;
      const params = { page, pageSize, [sortField]: searchText };
      let recordListResponse;

      recordListResponse = await PostRecordListAll(params);

      if (recordListResponse.status === 200) {
        const { list, total } = recordListResponse.data;
        setUserList(list);
        setTotalPages(Math.ceil(total / pageSize));
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      console.error(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const clickUserUnBan = (data: any) => {
    try {
      let params = {
        username: data.username,
        type: "1",
      };
      PostUserBan(params).then((res) => {
        if (res.status === 200) {
          showToast(res && (res as any).msg);
          PostUserAll(currentPage, "");
        }
      });
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      console.error(errorMessage);
      showToast(errorMessage);
    }
  };

  const clickUserBan = (data: any) => {
    if (data.role === "manage") {
      showToast("管理员账号禁止封禁");
      return;
    }
    try {
      let params = {
        username: data.username,
        type: "2",
      };
      PostUserBan(params).then((res) => {
        if (res.status === 200) {
          showToast(res && (res as any).msg);
          PostUserAll(currentPage, "");
        }
      });
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.msg ?? "网络请求出错，请重试";
      console.error(errorMessage);
      showToast(errorMessage);
    }
  };

  const goToPage = (page: any) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 10;
    const ellipsis = totalPages > maxPageNumbers;

    if (ellipsis) {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxPageNumbers / 2),
      );
      const endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

      if (startPage > 1) {
        pageNumbers.push(
          <span key={1} onClick={() => goToPage(1)}>
            1
          </span>,
        );
        if (startPage > 2) {
          pageNumbers.push(<span key="ellipsis-prev">...</span>);
        }
      }

      for (let page = startPage; page <= endPage; page++) {
        pageNumbers.push(
          <span
            key={page}
            onClick={() => goToPage(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </span>,
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(<span key="ellipsis-next">...</span>);
        }
        pageNumbers.push(
          <span key={totalPages} onClick={() => goToPage(totalPages)}>
            {totalPages}
          </span>,
        );
      }
    } else {
      for (let page = 1; page <= totalPages; page++) {
        pageNumbers.push(
          <span
            key={page}
            onClick={() => goToPage(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </span>,
        );
      }
    }

    return pageNumbers;
  };

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">所有订单</div>
            <div className="window-header-sub-title"></div>
          </div>
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<LeftIcon />}
                text={Locale.NewChat.Return}
                onClick={() => navigate(-1)}
              ></IconButton>
            </div>
          </div>
        </div>
        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder="请输入支付订单号 / 商家订单号 / 用户名"
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />

            <Select
              className={styles["mask-filter-lang"]}
              value={filterLang ?? Locale.Settings.Lang.All}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setFilterLang(value as Lang);
              }}
            >
              <option key="all" value={""}>
                {"默认"}
              </option>
              <option value="trade_no" key="trade_no">
                支付订单号
              </option>
              <option value="out_trade_no" key="out_trade_no">
                商家订单号
              </option>
              <option value="username" key="username">
                用户名
              </option>
            </Select>

            <IconButton
              className={styles["mask-create"]}
              icon={<ConfirmIcon />}
              text={"确认查询"}
              bordered
              onClick={() => {
                ClickSearch();
              }}
            />
          </div>

          <div className={styles["pageBox"]}>
            {/* 显示当前页码 */}
            <div className={styles["page"]}>当前页：{currentPage}</div>

            {/* 显示页码 */}
            <div className={styles["page"]}>
              <IconButton
                text="上一页"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              />
              {renderPageNumbers()}
              <IconButton
                text="下一页"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
          <div className={styles["loadding_f"]}>
            {loading && <LoadingIcon />}
          </div>
          <div
            className={`${styles.texts} ${loading ? styles.yes_loading : ""}`}
          >
            <div className={styles["mask-item"]}>
              <div className={styles["mask-header"]}>
                <div className={styles["mask-title"]}>
                  <div className={styles["mask-name"]}>用户</div>
                </div>
              </div>

              <div className={styles["mask-centent"]}>
                <div className={styles["user-text"]}>
                  <div>状态</div>
                </div>
              </div>
              <div className={styles["mask-centent"]}>
                <div className={styles["user-text"]}>
                  <div>支付金额</div>
                </div>
              </div>
              <div className={styles["mask-centent"]}>
                <div className={styles["user-text"]}>
                  <div>支付渠道</div>
                </div>
              </div>
              <div className={styles["mask-actions"]}>
                <div className={styles["mask-centent"]}>
                  <div className={styles["user-text"]}>
                    <div>记录</div>
                  </div>
                </div>
              </div>
            </div>

            {Array.isArray(userList) &&
              userList.map((m) => (
                <div className={styles["mask-item"]} key={m.id}>
                  <div className={styles["mask-header"]}>
                    <div className={styles["mask-title"]}>
                      <div className={styles["mask-name"]}>{m.username}</div>
                      <div className={styles["mask-info"] + " one-line"}>
                        {m.subject}
                      </div>
                    </div>
                  </div>

                  <div className={styles["mask-centent"]}>
                    <div className={styles["user-text"]}>
                      <div>
                        {(m.status as any) === "success" ? "已支付" : "未支付"}
                      </div>
                    </div>
                  </div>

                  <div className={styles["mask-centent"]}>
                    <div className={styles["user-text"]}>
                      <div>{m.buyer_pay_amount}</div>
                    </div>
                  </div>
                  <div className={styles["mask-centent"]}>
                    <div className={styles["user-text"]}>
                      <div>{m.payment_type}</div>
                    </div>
                  </div>

                  <div className={styles["mask-actions"]}>
                    <div className={styles["mask-centent"]}>
                      <div className={styles["user-text"]}>
                        <div>支付订单号{m.trade_no || " - 订单未支付"}</div>
                        <div>商家订单号{m.out_trade_no}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
