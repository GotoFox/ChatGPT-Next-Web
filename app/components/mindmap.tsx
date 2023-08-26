import React, { useEffect, useRef, useState } from "react";
import { Markmap } from "markmap-view";
import * as d3 from "d3";
import { Transformer } from "markmap-lib";
import { Toolbar } from "markmap-toolbar";

import styles from "./mindmap.module.scss";
import { Input, showConfirm, showToast } from "./ui-lib";
import LightningIcon from "@/app/icons/lightning.svg";
import CopyIcon from "@/app/icons/copy.svg";
import ResetIcon from "@/app/icons/reload.svg";
import LoadingIcon from "../icons/three-dots.svg";
import downloadIcon from "@/app/icons/module/download.svg";
import { IconButton } from "./button";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { api } from "../client/api";

export function MindMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatStore = useChatStore();
  const config = useAppConfig();
  const token = localStorage.getItem("access_token");
  const [markdownContent, setMarkdownContent] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const transformer = new Transformer();
  const svgRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
    if (containerRef.current && svgRef.current) {
      const container = d3.select(containerRef.current);
      const svg = d3.select(svgRef.current);

      svg.attr("width", "100%");
      svg.attr("height", "100%");

      svg.selectAll("*").remove();

      // 清除现有的工具栏
      container.selectAll(`.${styles["custom-toolbar"]}`).remove();

      if (markdownContent) {
        const { root } = transformer.transform(markdownContent);
        const markmapInstance = Markmap.create(
          svg.node() as SVGElement,
          undefined,
          root,
        );

        // 创建工具栏并将其附加到容器
        const { el } = Toolbar.create(markmapInstance);
        el.className = styles["custom-toolbar"];
        containerRef.current.append(el);

        // 删除包含 "markmap" 标识的链接元素
        const markmapBrand = el.querySelector(".mm-toolbar-brand");
        if (markmapBrand) {
          markmapBrand.remove();
        }

        // 设置工具栏中 div 元素的标题
        const toolbarItems = el.querySelectorAll(".mm-toolbar-item");
        const titles = ["放大", "缩小", "还原"]; // 标题数组，根据需要进行修改
        toolbarItems.forEach((toolbarItem, index) => {
          const title = titles[index];
          toolbarItem.setAttribute("title", title);
        });

        // 删除最后一个工具栏项
        const lastToolbarItem = toolbarItems[toolbarItems.length - 1];
        if (lastToolbarItem) {
          lastToolbarItem.remove();
        }
      } else {
        // 清除工具栏并隐藏工具栏容器
        const toolbar = container.select(`.${styles["custom-toolbar"]}`);
        if (toolbar) {
          toolbar.remove();
        }
      }
    }

    // 返回函数，在组件卸载时清除工具栏
    return () => {
      const toolbar = containerRef.current?.querySelector(
        `.${styles["custom-toolbar"]}`,
      );
      if (toolbar) {
        toolbar.remove();
      }
    };
  }, [markdownContent, containerRef.current]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast("已复制到剪贴板");
      },
      (err) => {
        showToast("复制失败");
        console.error("复制失败:", err);
      },
    );
  }

  const handleInputChange = (event: any) => {
    setMarkdownContent(event.target.value);
  };

  const handleContentInputChange = (event: any) => {
    setContent(event.target.value);
  };

  const handleClearMarkdown = () => {
    setMarkdownContent("");
  };

  const handleCopyMarkdown = () => {
    copyToClipboard(markdownContent);
  };

  const handleExample = () => {
    setMarkdownContent(`
# 会议流程

## 开场白
- 欢迎词
- 自我介绍

## 议程安排
- 介绍会议议程
- 确认议程是否被所有人接受

## 上一次会议的总结
- 回顾上次会议的议题及结果
- 确认上次会议的行动项是否已经完成

## 主题讨论
- 提出本次会议的主题
- 介绍主题相关背景信息
- 提出问题并进行讨论
- 形成共识或决策

## 行动项
- 确定行动项及责任人
- 确定完成时间和目标

## 公告和其他事项
- 公告即将到来的活动或项目
- 公告公司的其他事项

## 结束语
- 感谢所有人的参与
- 总结会议内容
- 确认下一次会议的时间和议题
`);
  };

  const typeWriterEffect = (text: string) => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setMarkdownContent(text.substring(0, currentIndex));
      currentIndex++;
      if (currentIndex > text.length) {
        clearInterval(intervalId);
      }
    }, 5); // 调整打字速度，单位为毫秒
  };

  const handleGenerateAMindMap = async () => {
    setLoading(true);
    try {
      const message = await api.PostGenerateAMindMap(
        { content: content },
        (responseText, delta) => {},
      );
      typeWriterEffect(message);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error as any).response?.data?.msg ||
        (error as any).response?.data ||
        Locale.authModel.Toast.error;
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mindmap}>
      <div className={styles.operatingArea}>
        <div className={styles.moduleTitle}>思维导图</div>
        <div className={styles.operationControl}>
          <div>需求描述</div>
          <Input
            value={content}
            placeholder={
              "请输入简单的描述，AI助手会帮你思考并智能总结。例如：青椒炒肉"
            }
            onChange={handleContentInputChange}
            className={styles["edit-content"]}
            rows={5}
          ></Input>
          <IconButton
            text={"生成思维导图描述"}
            icon={<LightningIcon />}
            type="primary"
            shadow
            disabled={loading || !isLogin || !content}
            onClick={handleGenerateAMindMap}
            className={styles.skip}
          />
          <div className={styles.contentRequirementsTitle}>
            <span>内容需求</span>
            <span className={styles.example} onClick={handleExample}>
              示例
            </span>
          </div>
          <Input
            value={markdownContent}
            onChange={handleInputChange}
            placeholder={"请输入Markdown语法的内容"}
            className={styles["edit-content"]}
            rows={30}
          ></Input>
          <div className={styles.footerBtn}>
            <IconButton
              text={"复制Markdown"}
              shadow
              disabled={!markdownContent}
              icon={<CopyIcon />}
              className={styles.skip}
              onClick={handleCopyMarkdown}
            />
            <IconButton
              text={"清空"}
              shadow
              disabled={!markdownContent}
              icon={<ResetIcon />}
              className={styles.skip}
              onClick={handleClearMarkdown}
            />
          </div>
        </div>
      </div>
      <div className={styles.displayArea}>
        <div ref={containerRef} className={styles.containerRef}>
          {loading ? (
            <LoadingIcon />
          ) : (
            <>
              {markdownContent ? (
                <>
                  <svg ref={svgRef} id="markmap"></svg>
                  <div ref={toolbarRef}></div>
                </>
              ) : (
                <div>暂无思维导图生成，快去左侧输入思维导图描述吧</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
