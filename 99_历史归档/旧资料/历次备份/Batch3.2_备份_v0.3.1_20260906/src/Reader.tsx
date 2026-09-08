import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import original from "../docs/PRD_v0.6.md?raw";
import originalUrl from "../docs/PRD_v0.6.md?url";
import sourceUrl from "../docs/SOURCES_v0.6.md?url";
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
          推荐控制链路
        </Link>
        <nav aria-label="阅读导航">
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
            <h1>网易云音乐｜推荐控制链路优化</h1>
            <p className="document-subtitle">产品需求文档与交互原型</p>
            <p className="document-meta">
              PRD v0.6 · 原型 v{version} · 2026-09-06 · 提交候选
            </p>
            <div className="document-actions">
              <a href={originalUrl} download="PRD_v0.6_提交候选.md">
                下载正文（MD）
              </a>
              <a href="./documents/PRD_v0.6_提交候选.docx" download>
                下载正文（Word）
              </a>
              <button onClick={() => window.print()}>打印完整文档</button>
            </div>
          </header>
          <article className="prd-body" aria-label="PRD v0.6 提交候选正文">
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
                      a: ({ href, children }) => (
                        <a
                          href={href === "SOURCES.md" ? sourceUrl : href}
                          download={
                            href === "SOURCES.md" ? "SOURCES.md" : undefined
                          }
                        >
                          {children}
                        </a>
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
                  </div>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  );
}
