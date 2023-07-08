import React, { useEffect, useState } from "react";
import { Modal, showToast } from "./ui-lib";
import { IconButton } from "./button";
import styles from "./AnnouncementModel.module.scss";
import DeleteIcon from "@/app/icons/delete.svg";
import { PostLatestNews } from "@/app/http/plan";
import LoadingIcon from "@/app/icons/three-dots.svg";

export function AnnouncementModel(props: {
  showAnnouncemnentModal: boolean;
  setShowAnnouncemnentModal: (show: boolean) => void;
}) {
  const [latestNews, setLatestNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Check whether the user has visited before
  useEffect(() => {
    const storedVisitInfo = localStorage.getItem("visitInfo");
    const visitInfo = storedVisitInfo ? JSON.parse(storedVisitInfo) : null;

    if (visitInfo) {
      if (visitInfo.visitDate <= new Date().getTime()) {
        localStorage.removeItem("visitInfo");
        setIsFirstVisit(true);
      } else {
        setIsFirstVisit(false);
      }
    } else {
      setIsFirstVisit(true);
    }
  }, []);

  useEffect(() => {
    if (props.showAnnouncemnentModal || isFirstVisit) {
      (async () => {
        await doLatestNews();
      })();
    }
  }, [props.showAnnouncemnentModal]);

  // 查询最新消息
  async function doLatestNews() {
    setLoading(true);
    try {
      let res = await PostLatestNews();
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
      {(props.showAnnouncemnentModal || isFirstVisit) && (
        <div className="modal-mask">
          <Modal
            title={"最新消息"}
            onClose={() => {
              props.setShowAnnouncemnentModal(false);
              setIsFirstVisit(false);
              const visitInfo = {
                notFirstVisit: true,
                visitDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // 7 days later
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
                  setIsFirstVisit(false);
                  const visitInfo = {
                    notFirstVisit: true,
                    visitDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // 7 days later
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
