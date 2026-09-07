import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import original from "../docs/PRD_v0.5.1.md?raw";
import originalUrl from "../docs/PRD_v0.5.1.md?url";
import sourceUrl from "../docs/SOURCES.md?url";
import flowUrl from "../design/flow_roles.png";
import { version } from "../package.json";

export const sections = original
  .split(/(?=^## \d{2}｜)/m)
  .slice(1)
  .map((body) => ({
    id: body.match(/^## (\d{2})/)![1],
    title: body.split("\n")[0].replace(/^## /, "").trim(),
    body,
  }));
const introduction = original.split(/^## 01｜/m)[0];
const flows: Record<string, string> = {
  "06": "R03 · 推荐调整",
  "07": "R03 · 推荐结果",
  "08": "R03 / R04 · 范围与保护",
  "09": "R04 · 会话与提醒",
  "10": "R03 / R04 · 正逆向流程",
  "11": "R03 / R04 · 保存与撤销",
  "12": "R04 · 事件边界",
  "13": "R07 · 候选进入草稿",
};

export default function Reader() {
  const location = useLocation();
  const current = new URLSearchParams(location.search).get("section") ?? "01";
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? sections.filter((s) =>
        s.body.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
      )
    : [];
  useEffect(() => {
    if (!location.search) return;
    const section = document.getElementById(`section-${current}`);
    section?.scrollIntoView({ behavior: "instant", block: "start" });
    section?.focus({ preventScroll: true });
  }, [current, location.key, location.search]);
  return (
    <div className="reader-page">
      <header className="reading-header">
        <Link className="reading-brand" to="/">
          推荐控制链路 / PRD
        </Link>
        <nav aria-label="阅读导航">
          <Link to="/overview">项目概览</Link>
          <Link to="/demo">交互原型 ↗</Link>
        </nav>
      </header>
      <main className="reading-layout">
        <aside className="reading-index" aria-label="文档目录与检索">
          <details open className="contents">
            <summary>完整目录 · 01—19</summary>
            <nav aria-label="PRD 章节目录">
              {sections.map((s) => (
                <Link
                  key={s.id}
                  to={`/?section=${s.id}`}
                  aria-current={current === s.id ? "location" : undefined}
                >
                  {s.title}
                </Link>
              ))}
            </nav>
          </details>
          <div className="reading-search">
            <label htmlFor="prd-search">搜索正文</label>
            <input
              id="prd-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：使用频率"
            />
            <p className="reading-hint">正文完整展开，也可使用浏览器查找。</p>
            {query.trim() && (
              <>
                <p role="status">
                  包含“{query}”的章节：{results.length}
                </p>
                <ul>
                  {results.map((s) => (
                    <li key={s.id}>
                      <Link to={`/?section=${s.id}`}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
        <div className="reading-content">
          <header className="document-title">
            <p className="eyebrow">产品需求文档与交互原型</p>
            <h1>网易云音乐｜推荐控制链路优化</h1>
            <dl className="document-versions">
              <div>
                <dt>文档版本</dt>
                <dd>v0.5.1 · 原文保留</dd>
              </div>
              <div>
                <dt>应用版本</dt>
                <dd>v{version} · 本地模拟</dd>
              </div>
              <div>
                <dt>验证状态</dt>
                <dd>Batch 3 负责人待复核</dd>
              </div>
            </dl>
            <p className="document-disclaimer">
              个人产品概念，非网易官方项目。虚构歌曲与自制封面；无真实音频、账号或模型。真人任务验证：NOT_RUN。
            </p>
            <div className="document-actions">
              <a href={originalUrl} download="PRD_v0.5.1.md">
                下载 PRD 原文（Markdown）
              </a>
              <a href="./documents/PRD_v0.5.1_阅读资料.zip" download>
                下载原文与图示（ZIP）
              </a>
              <button onClick={() => window.print()}>打印完整文档</button>
            </div>
          </header>
          <aside
            className="implementation-note"
            aria-label="当前实现与历史原文的区别"
          >
            <strong>阅读说明 / 历史原文与当前实现</strong>
            <p>
              以下 01—19 节逐节呈现 PRD
              原文。原文的“本轮”“尚未实现”等状态对应文档编写阶段；不代表当前代码状态。
            </p>
            <p>
              v0.2.3 已通过本地 Beta
              产品/视觉审查，本轮在此基础上增加阅读与原型关联，仍待负责人复核。R03/R04
              已有本地模拟，R07 仅规则候选实验；R05/R06 为后续方案。§16 的“B3
              用户与视觉验证”是历史阶段定义，本轮 Batch 3
              阅读层交付不等于该阶段的真人验证完成。
            </p>
            <p>
              87 项单元、73 项 E2E 是 v0.2.3 的 Codex
              存档执行结果；负责人未独立重跑整套测试，浏览器访问曾被
              ERR_BLOCKED_BY_ADMINISTRATOR
              阻止。新批工程报告放在交付包，不作为产品效果。
            </p>
            <a href={sourceUrl} download="SOURCES.md">
              资料引用完整 URL 与核验边界
            </a>
          </aside>
          <article className="prd-body" aria-label="完整 PRD 原文">
            <div className="prd-original-intro">
              <Markdown remarkPlugins={[remarkGfm]}>{introduction}</Markdown>
            </div>
            {sections.map((s) => (
              <section
                key={s.id}
                id={`section-${s.id}`}
                data-prd-section={s.id}
                tabIndex={-1}
              >
                <div className="original-section">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children, node }) => (
                        <div
                          className="prd-table-scroll"
                          tabIndex={0}
                          role="region"
                          aria-label={`${s.title} 第${node?.position?.start.line}行表格，可横向滚动`}
                        >
                          <table>{children}</table>
                        </div>
                      ),
                      img: ({ src, alt }) => (
                        <img
                          src={
                            src === "../design/flow_roles.png" ? flowUrl : src
                          }
                          alt={alt}
                        />
                      ),
                    }}
                  >
                    {s.body}
                  </Markdown>
                </div>
                {flows[s.id] && (
                  <div className="section-prototype">
                    <span>{flows[s.id]}</span>
                    <Link to={`/demo?from=${s.id}`}>体验对应流程 ↗</Link>
                    <p>
                      使用当前演示状态，不自动加载示例；调整后可返回本节继续阅读。
                    </p>
                  </div>
                )}
              </section>
            ))}
          </article>
          <footer className="reading-footer">
            PRD v0.5.1 原文结束 · 01—19
            节完整保留。真实用户、真实模型与线上结果尚未验证。
          </footer>
        </div>
      </main>
    </div>
  );
}
