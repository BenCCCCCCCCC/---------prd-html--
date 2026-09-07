import { Link } from "react-router-dom";
import decisions from "../specs/portfolio-decisions.json";
import Demo from "./Demo";
import verification from "./generated/verification.json";
import { Icon, Section } from "./components";
type Decision = (typeof decisions.decisions)[number];
const labels: Record<string, string> = {
  selected: decisions.terminology.selectedLabel,
  rejected: decisions.terminology.rejectedLabel,
  deferred: decisions.terminology.deferredLabel,
};
export function DecisionCard({
  d,
  quick = false,
}: {
  d: Decision;
  quick?: boolean;
}) {
  const selected = d.options.find((o) => o.id === d.selectedOption)!;
  return (
    <article
      className={"decision " + (quick ? "quick" : "deep")}
      data-decision-id={d.id}
    >
      <div className="decision-meta">
        {d.id} <span>{d.title}</span>
      </div>
      <h3>{d.question}</h3>
      <div className="chosen">
        <span>采用 {selected.id}</span>
        <h4>{selected.label}</h4>
        <p>{selected.reason}</p>
      </div>
      <p className="criteria">判断标准 / {d.criteria.join(" · ")}</p>
      <p>
        <strong>代价</strong> {d.tradeoff}
      </p>
      <details>
        <summary>为什么没有选 A / C</summary>
        {d.options
          .filter((o) => o.id !== d.selectedOption)
          .map((o) => (
            <div className="alternative" key={o.id}>
              <span>
                {labels[o.status]} · 方案 {o.id}
              </span>
              <h4>{o.label}</h4>
              <p>{o.reason}</p>
            </div>
          ))}
      </details>
      <p className="validation">
        <strong>怎样验证 / 反转条件</strong>
        <br />
        {d.validation}
      </p>
    </article>
  );
}
export default function Portfolio() {
  return (
    <>
      <header className="case-nav">
        <Link className="wordmark" to="/">
          <span className="brand-mark" aria-hidden="true">
            ◎
          </span>
          推荐，听你调整<span className="beta">LOCAL BETA</span>
        </Link>
        <nav aria-label="案例导航">
          <a href="#case">Case</a>
          <Link to="/demo">Demo</Link>
          <a href="#evidence">Evidence</a>
          <a href="#reflection">Reflection</a>
        </nav>
        <Link className="nav-cta" to="/demo">
          进入 Demo <Icon name="arrow" />
        </Link>
      </header>
      <main className="case-container">
        <section className="hero" id="case">
          <div className="hero-copy">
            <p className="eyebrow">
              AI Product / Recommendation Control / Concept Prototype
            </p>
            <h1>
              推荐可以懂你，
              <br />
              <span>也应该听你调整</span>
            </h1>
            <p className="hero-description">
              让用户说明“这次想听什么、不要什么、影响多久”，且可以修正和撤销。
            </p>
            <p className="role">个人产品概念 / 产品策略、交互与 AI 边界设计</p>
            <div className="hero-actions">
              <Link className="primary" to="/demo">
                体验 3 分钟 Demo <Icon name="arrow" />
              </Link>
              <a className="secondary-link" href="#decisions">
                查看产品决策 ↓
              </a>
            </div>
            <p className="honesty">
              无真实问卷原始数据 · 未接真实账号/模型
              <br />
              没有上线业务结果 · 非网易官方项目
            </p>
            <div className="hero-index">
              <span>01 显式控制</span>
              <span>02 临时保护</span>
              <span>03 可撤销</span>
            </div>
          </div>
          <div className="hero-device">
            <div className="device-caption">
              <span>从一次听歌出发</span>
              <span>R03 + R04 ↙</span>
            </div>
            <Demo preview />
          </div>
        </section>
        <div className="evidence-strip">
          <div>
            <span>FACT</span>课程作业与老师反馈
          </div>
          <div>
            <span>INFERENCE</span>控制入口需要聚合
          </div>
          <div>
            <span>HYPOTHESIS</span>需求与业务效果待验证
          </div>
          <div>
            <span>SIMULATION</span>曲库、排序与事件
          </div>
        </div>
        <Section id="decisions" no="01" title="三个决定，让控制变得具体。">
          <p className="section-intro">
            没有重做推荐算法。我先回答三个更接近用户的问题：在哪里调、影响什么、由谁确认。
          </p>
          <div className="decision-grid" data-testid="quick-decisions">
            {decisions.quickScanDecisionIds.map((id) => (
              <DecisionCard
                key={id}
                d={decisions.decisions.find((d) => d.id === id)!}
                quick
              />
            ))}
          </div>
        </Section>
        <Section id="evidence" no="02" title="从现象到决策，不跳过证据边界。">
          <div className="evidence-flow">
            <article>
              <span>现象 / FACT</span>
              <h3>入口分散，纠偏路径不连续</h3>
              <p>
                课程作业与原型复盘记录了控制入口分散。它能支持发现性问题，不能证明当前每个版本仍相同。
              </p>
            </article>
            <article>
              <span>机制 / INFERENCE</span>
              <h3>“找不到”与“调了无效”不同</h3>
              <p>
                短期意图、长期偏好、临时情境可能混在一起；版权、候选池与兴趣变化也是替代解释。
              </p>
            </article>
            <article>
              <span>决策 / HYPOTHESIS</span>
              <h3>先让意图可表达、可纠正</h3>
              <p>
                R03 聚合设置，R04
                隔离普通行为；分别检验发现、理解与结果，不能只看入口点击。
              </p>
            </article>
          </div>
          <div className="two-column">
            <div>
              <h3>频率不等于需求类型</h3>
              <p>
                28 个完整自然日内推荐活跃 ≥16 天、4–15 天、1–3 天、0
                天分层；不足窗口记“观察不足”。这些是初始招募口径，未经真实数据校准。
              </p>
              <p>
                强度看全部音乐活跃日平均实际分钟数；新老程度不代替控制熟练度。推荐依赖保留分子、分母与来源。
              </p>
            </div>
            <div>
              <h3>用任务交叉，而不是虚构人物卡</h3>
              <ul>
                <li>高频短时 × 精准偏好：调整是否比跳歌更费事？</li>
                <li>低频长时 × 熟练探索：能否覆盖本轮任务？</li>
                <li>存量用户 × 控制新手：能否复述范围与撤销？</li>
                <li>任意频率 × 临时共听：保护是否跨来源持续？</li>
              </ul>
            </div>
          </div>
        </Section>
        <Section
          id="industry"
          no="03"
          title="行业已有自然语言，差异在控制权限。"
        >
          <p className="section-intro">
            课程时期的 QQ 音乐、Apple Music
            与网易云实机观察，保留为历史输入。以下是启动包记录的 2026
            后续行业复核，不是本项目用户研究。
          </p>
          <div className="industry-list">
            <article>
              <span>SPOTIFY / 2026</span>
              <h3>Taste Profile Beta 与对象排除</h3>
              <p>
                包内复核记录：已开放地区的文字偏好调整进入产品实验。排除曲目/歌单时需区分播放上下文；R07
                不宣称行业首创。
              </p>
              <a href="https://support.spotify.com/nz/article/your-taste-profile/">
                [S06] Taste Profile
              </a>{" "}
              ·{" "}
              <a href="https://support.spotify.com/id-en/article/exclude-playlists-or-tracks-from-your-taste-profile/">
                [S07] 排除边界
              </a>
            </article>
            <article>
              <span>APPLE / LISTENING HISTORY</span>
              <h3>临时隔离具有行业可行性</h3>
              <p>
                Use Listening History 与 Focus
                场景为临时收听提供参考；不能据此证明网易云用户需要相同交互。
              </p>
              <a href="https://support.apple.com/en-in/guide/music/musf7da17c25/mac">
                [S08] Apple 支持
              </a>
            </article>
            <article>
              <span>NETEASE / 2026 RESEARCH</span>
              <h3>Melo / Muse Mix：生产实践的启发</h3>
              <p>
                启动包收录的研究描述自然语言推荐生产实践。这里仅借鉴固定步骤、实体
                grounding、明确失败与修复；R07
                聚焦控制层和权限预览，不生成完整歌单。
              </p>
              <a href="https://arxiv.org/abs/2607.23718">[S25] Melo 论文</a>
            </article>
          </div>
          <p className="source-note">
            来源为已批准启动包的研究快照，实时页面可用性与最新发布状态在公开发布审查前重核。NetEase
            2026 H1 信息只作成熟业务背景，不证明本方案能提高收入或留存。
            <a href="https://ir.netease.com/news-releases/news-release-details/netease-announces-second-quarter-and-interim-2026-unaudited">
              [S26] 公司公开信息
            </a>
          </p>
        </Section>
        <Section id="alternatives" no="04" title="采用什么，也说清放弃了什么。">
          <p className="section-intro">
            {decisions.terminology.designComparison}{" "}
            是设计阶段比较。每项先看采用方案、理由和代价，再展开未采用或延后的方案；当前没有真实线上实验。
          </p>
          <div className="deep-decisions" data-testid="deep-decisions">
            {decisions.decisions.map((d) => (
              <details key={d.id}>
                <summary>
                  {d.id} / {d.title}
                  <span>
                    {d.options.find((o) => o.id === d.selectedOption)?.label}
                  </span>
                </summary>
                <DecisionCard d={d} />
              </details>
            ))}
          </div>
        </Section>
        <Section id="core" no="05" title="保存多久，与学习什么，分开决定。">
          <div className="scope-matrix">
            {[
              [
                "仅本次",
                "关闭",
                "显式调整只在会话中；普通听歌仍可参与长期学习。",
              ],
              [
                "仅本次",
                "开启",
                "显式调整只在会话中；普通播放、时长和跳过隔离。",
              ],
              ["长期偏好", "关闭", "本轮明确差异长期保存；普通听歌照常处理。"],
              ["长期偏好", "开启", "明确差异长期保存；普通收听仍受到保护。"],
            ].map(([scope, isolation, text]) => (
              <article key={scope + isolation}>
                <span>
                  {scope} × 临时收听{isolation}
                </span>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="two-column">
            <div>
              <h3>确定性执行层负责落地</h3>
              <p>
                用户确认 → 偏好层校验版本与字段 → 应用设置 →
                推荐侧刷新对应版本。刷新失败会单独提示，旧响应不会覆盖新设置；撤销只恢复相关字段。
              </p>
              <p>
                少推是软降权，仍可能出现；黑名单是强约束，首版只读。R03
                不重排搜索或手动歌单。
              </p>
            </div>
            <div>
              <h3>提醒到期，保护仍然继续</h3>
              <p>
                暂停闲置 30 分钟或达到 4 小时，R03 本次覆盖结束；R04 进入
                review_required，继续保护，直到明确继续或关闭。
              </p>
              <p>
                收藏等主动操作保留；关闭仅影响之后的片段，之前隔离的事件不会回填。这不是删除历史或模型遗忘。
              </p>
            </div>
          </div>
          <Link className="secondary-link" to="/demo">
            在 Demo 中验证四种组合 <Icon name="arrow" />
          </Link>
        </Section>
        <Section id="ai" no="06" title="AI 先提议，用户再决定。">
          <p className="section-intro">
            AI 建议草稿（实验） · 本地规则模拟 · 不调用真实模型。独立关闭 R07
            后，R03 / R04 仍可完整使用。
          </p>
          <ol className="pipeline">
            {[
              "输入：有限标签与上下文",
              "解析：生成可编辑候选",
              "校验：Schema / 字典 / 冲突 / 权限",
              "采用：只进入手动草稿",
              "确认：用户授予本轮执行意图",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p>
            识别不清就询问，超出能力就说明；范围和保护只是建议，未知标签不会偷偷映射。40
            条公开合成用例与 6
            条非法输出夹具用于代码回归，不是独立盲测或真实模型效果。
          </p>
        </Section>
        <Section id="validation" no="07" title="先检查做对，再验证是否有用。">
          <div className="validation-status">
            <div>
              <span>规格状态</span>
              <strong>已批准本地 Beta</strong>
            </div>
            <div>
              <span>代码验证</span>
              <strong>
                {verification.unitPassed} 单元 / {verification.e2ePassed}{" "}
                浏览器用例通过
              </strong>
            </div>
            <div>
              <span>真人与线上实验</span>
              <strong>尚未完成</strong>
            </div>
          </div>
          <h3>四类风险，一起评估</h3>
          <div className="risk-grid">
            {[
              [
                "Value",
                "是否值得用户花时间？",
                "原型可检验理解和意愿，不能证明需求发生率或留存。",
              ],
              [
                "Usability",
                "能否找到、理解、撤销？",
                "先测试入口、范围与少推/屏蔽区分，再检查任务失败。",
              ],
              [
                "Feasibility",
                "状态与事件能否一致？",
                "本地可验幂等、切片和降级，平台服务成本仍待研发核验。",
              ],
              [
                "Viability",
                "控制会否损害长期体验？",
                "监测多样性、总收听与投入；不承诺商业收益。",
              ],
            ].map(([label, q, text]) => (
              <article key={label}>
                <span>{label}</span>
                <h4>{q}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <h3>A/B 对照实验：先过健康 Gate，再看效果</h3>
          <ol className="gates">
            <li>检查埋点完整性、时间戳、assignment 与 exposure。</li>
            <li>验证分桶与随机化；SRM 异常先停止效果解读。</li>
            <li>先做 A/A 或最小事件链路验证。</li>
            <li>分层只用实验前特征，保留缺失与观察不足。</li>
            <li>OEC、诊断、Guardrail 与数据质量并列；分母为零记 N/A。</li>
            <li>
              每个灰度 ring 预设 pass / hold /
              rollback。保护泄漏立即停止错误写入。
            </li>
          </ol>
          <p>
            本地尚未执行真实 A/B
            对照实验。样本量需基线方差与最小业务差异，不能凭空填“每组十万”；点击与调整后指标也不能单独证明因果。
          </p>
        </Section>
        <Section
          id="reflection"
          no="08"
          title="一个可审查的原型，一组尚待验证的判断。"
        >
          <div className="two-column">
            <div>
              <h3>已完成的交付对象</h3>
              <p>
                产品契约、方案取舍、可交互本地 Beta、合成数据与可重复验收。具体
                PASS / FAIL 以同包 handback 和运行报告为准。
              </p>
              <h3>尚未证明</h3>
              <p>
                真实需求强度、真人理解成本、真实模型泛化、线上效果及网易内部集成可行性。
              </p>
            </div>
            <div>
              <h3>下一步</h3>
              <p>
                先做 8
                个席位的覆盖型任务测试，记录具体失败和经同意的原话；复测两种范围概念，再决定是否保留
                R07。真实模型和公开发布分别审查授权。
              </p>
              <p>
                R05 历史影响管理、R06 手势仍延后，不能因写入 PRD
                就自动扩展首版。
              </p>
              <Link className="primary" to="/demo">
                开始 3 分钟体验 <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <footer className="case-footer">
        <span>推荐，听你调整 / 2026 · Concept Prototype</span>
        <p>
          个人产品概念，非网易官方项目。合成曲库，无真实音频、账号、模型或上线业务结果。
        </p>
      </footer>
    </>
  );
}
