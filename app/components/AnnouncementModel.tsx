import React, { useEffect, useState } from "react";
import { Modal, showToast } from "./ui-lib";
import { IconButton } from "./button";
import styles from "./AnnouncementModel.module.scss";
import DeleteIcon from "@/app/icons/delete.svg";
import { PostLatestNews } from "@/app/http/plan";
import LoadingIcon from "@/app/icons/three-dots.svg";
import { api } from "../client/api";

export function AnnouncementModel(props: {
  showAnnouncemnentModal: boolean;
  setShowAnnouncemnentModal: (show: boolean) => void;
}) {
  const [latestNews, setLatestNews] = useState("");
  const [loading, setLoading] = useState(false);

  // 检查用户是否首次访问或是否该再次显示弹窗
  useEffect(() => {
    const visitInfoJSON = localStorage.getItem("visitInfo");
    const visitInfo = visitInfoJSON ? JSON.parse(visitInfoJSON) : null;
    const now = new Date().getTime();

    if (!visitInfo || now >= visitInfo.visitDate) {
      props.setShowAnnouncemnentModal(true);
    }
  }, []);

  useEffect(() => {
    if (props.showAnnouncemnentModal) {
      (async () => {
        await doLatestNews();
      })();
    }
  }, [props.showAnnouncemnentModal]);

  // 查询最新消息
  async function doLatestNews() {
    setLoading(true);
    try {
      let res = await api.PostLatestNews();
      if (res.status === 200) {
        setLatestNews(res.data[0]?.content ?? "");
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
    <div>
      {props.showAnnouncemnentModal && (
        <div className="modal-mask">
          <Modal
            title={"最新消息"}
            onClose={() => {
              props.setShowAnnouncemnentModal(false);
              const visitInfo = {
                visitDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // test phase: 10 seconds
              };
              localStorage.setItem("visitInfo", JSON.stringify(visitInfo));
            }}
            actions={[
              <IconButton
                key="cancel"
                bordered
                text={"知道了"}
                icon={<DeleteIcon />}
                onClick={() => {
                  props.setShowAnnouncemnentModal(false);
                  const visitInfo = {
                    visitDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
                  };
                  localStorage.setItem("visitInfo", JSON.stringify(visitInfo));
                }}
              />,
            ]}
          >
            <div>
              {loading ? (
                <div className={styles["auth-loading"]}>
                  {loading && <LoadingIcon />}
                </div>
              ) : (
                <div
                  className={styles["auth-modal"]}
                  dangerouslySetInnerHTML={{ __html: latestNews }}
                ></div>
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
