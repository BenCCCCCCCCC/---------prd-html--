from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
p=r/'src/Demo.tsx';s=p.read_text(encoding='utf-8')
s=s.replace('Cover, Icon, tagLabel, freshLabel, targetLabel','Icon, tagLabel, freshLabel')
s=s.replace('import { restore, save, resetStorage }', 'import ReferencePlayer, { ReferenceCover } from "./ReferencePlayer";\nimport { displayTrack, displayTarget as targetLabel } from "./playerPresentation";\nimport Annotations from "./Annotations";\nimport { restore, save, resetStorage }')
a=s.index('  const [scenario,');b=s.index('  const [queueOpen',a)
s=s[:a]+'  const [showAnnotations, setShowAnnotations] = useState(true);\n'+s[b:]
a=s.index('          <div className="scenario-tabs"');b=s.index('        </header>',a)
toolbar=s[a:b]
reset=toolbar[toolbar.index('          <button\n            onClick'):]
s=s[:a]+'''          <span>交互原型</span>
          <label className="annotation-toggle"><input type="checkbox" checked={showAnnotations} onChange={e=>setShowAnnotations(e.target.checked)}/>显示标注</label>
          {state.aiEnabled && <button onClick={()=>open("ai")}>AI 实验 · 本地解析</button>}
'''+s[b:]
a=s.index('          <div className="product-top">');b=s.index('          <div\n            className={',a)
s=s[:a]+'''          {queueOpen && <div className="product-top"><button onClick={()=>setQueueOpen(false)}>返回播放器</button></div>}
'''+s[b:]
s=s.replace('          <div\n            className={\n              "protection-bar', '          {state.protection !== "off" && <div\n            className={\n              "protection-bar',1)
s=s.replace('            <span>{protectedText}</span>\n          </div>','            <span>{protectedText}</span>\n          </div>}',1)
a=s.index('            <>\n              <div className="record-stage">');b=s.index('          ) : (\n            <div className="queue">',a)
s=s[:a]+'''            <ReferencePlayer track={track} state={state}
              onOpen={(quick)=>open(quick?"negative":"root",!!quick)} onQueue={()=>setQueueOpen(true)}
              onHeart={()=>update(playback(state,"heart"))} onToggle={()=>update(playback(state,"toggle"))}
              onNext={()=>update(playback(state,"next"))}/>
'''+s[b:]
s=s.replace('className="product"','className={`product reference-product ${queueOpen ? "queue-product" : "full-player"}`}')
s=s.replace('<h2>演示推荐</h2>','<h2>推荐队列</h2>').replace('<button onClick={() => open()}>调整推荐</button>','<button onClick={() => open()}>调整本次推荐偏好</button>')
s=s.replace('<Cover small />','<ReferenceCover track={t} small />',1)
s=s.replace('{t.title.replace("（演示）", "")}','{displayTrack(t).title}').replace('{t.artistName} ·','{displayTrack(t).artist} ·')
s=s.replace('{track.title.replace("（演示）", "")}','{displayTrack(track).title}').replace('{draft.track.title}','{displayTrack(draft.track).title}')
s=s.replace('          <div className="mini-player">','          {queueOpen && <div className="mini-player">')
s=s.replace('<Cover small />','<ReferenceCover track={track} small />')
s=s.replace('            <Icon name={state.protection === "off" ? "play" : "shield"} />\n          </div>','            <Icon name={state.protection === "off" ? "play" : "shield"} />\n          </div>}')
a=s.index('            <details className="review-guide"');b=s.index('            <label className="source-select">',a)
s=s[:a]+'''            {!draft && showAnnotations && <Annotations state={state} draft={null} panel={panel} hasReceipt={!!receipt} root={product} onHide={()=>setShowAnnotations(false)}/>}
            <button className="full" aria-expanded={notes} onClick={()=>setNotes(!notes)}>测试工具 · {notes?"收起":"展开"}</button>
            {notes && <div className="testing-tools">
'''+reset+s[b:]
a=s.index('            {state.aiEnabled && (\n              <button className="text-button"');b=s.index('              <div className="notes-content">',a)
s=s[:a]+s[b:]
s=s.replace('              </div>\n            )}\n            <div className="demo-reading-note">','              </div>\n            </div>}\n            <div className="demo-reading-note">',1)
a=s.index('            <div className="demo-reading-note">');b=s.index('            {storageWarning',a)
s=s[:a]+s[b:]
s=s.replace('className={`sheet sheet-${panel}`}','className={`sheet sheet-${panel} submission-sheet`}')
s=s.replace('root: "调整推荐",','root: "调整推荐偏好",')
s=s.replace('                本地规则模拟 · 不调用真实模型','                本地解析')
s=s.replace('              <div className="notes-content">','              <div className="notes-content">',1)
# Right column belongs to the same native modal top layer; business backdrop remains inert.
s=s.replace('        {draft && (\n          <div className="sheet-inner">','''        {draft && showAnnotations && !preview && <Annotations state={state} draft={draft} panel={panel} hasReceipt={!!receipt} root={dialog} modal onHide={()=>setShowAnnotations(false)}/>}
        {draft && (
          <div className="sheet-inner">''')
s=s.replace('                    className="sheet-row"','                    className="sheet-row"\n                    data-panel={row[2]}') if 'className="sheet-row"' in s and 'rows.map((row)' in s else s
# The snapshot object and parser use IDs; shown names come from one presentation mapping.
s=s.replace('                  <summary>当前调整与恢复</summary>','                  <summary>当前调整与恢复</summary>\n                  <p>{protectedText}</p>')
p.write_text(s,encoding='utf-8')
p=r/'package.json';v=json.loads(p.read_text());v['version']='0.3.1';p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=r/'src/main.tsx';s=p.read_text();s=s.replace('import "./reader.css";','import "./reader.css";\nimport "./submission.css";');p.write_text(s)
