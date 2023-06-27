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
      {props.showAnnouncemnentModal && (
        <div className="modal-mask">
          <Modal
            title={"最新消息"}
            onClose={() => {
              props.setShowAnnouncemnentModal(false);
            }}
            actions={[
              <IconButton
                key="cancel"
                bordered
                text={"知道了"}
                icon={<DeleteIcon />}
                onClick={() => {
                  props.setShowAnnouncemnentModal(false);
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
