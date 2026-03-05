// src/components/Editor/MarkdownView.jsx

import { useMemo } from 'react';

export default function MarkdownView({ content }) {
  const html = useMemo(() => {
    if (!content) return '<em style="color:#6c7086">Nothing here yet…</em>';
    return content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^---$/gm, '<hr/>')
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- \[x\] (.+)$/gm, "<label class='todo done'><input type='checkbox' disabled checked/> $1</label>")
      .replace(/^- \[ \] (.+)$/gm, "<label class='todo'><input type='checkbox' disabled/> $1</label>")
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  }, [content]);

  return (
    <>
      <style>{`
        .md h1{color:#cdd6f4;font-size:2em;font-weight:800;margin:0 0 .6em;line-height:1.2}
        .md h2{color:#cba6f7;font-size:1.4em;font-weight:700;margin:1.4em 0 .5em}
        .md h3{color:#cba6f7;font-size:1.15em;font-weight:600;margin:1.2em 0 .4em}
        .md strong{color:#f5c2e7} .md em{color:#f9e2af}
        .md code{background:#313244;color:#a6e3a1;padding:2px 7px;border-radius:5px;font-size:.88em;font-family:monospace}
        .md hr{border:none;border-top:1px solid #45475a;margin:1.5em 0}
        .md blockquote{border-left:3px solid #cba6f7;margin:0;padding:.5em 1em;background:#181825;border-radius:0 8px 8px 0;color:#a6adc8}
        .md ul{list-style:none;padding:0;margin:.4em 0}
        .md li{padding:2px 0;display:flex;gap:8px;align-items:baseline;color:#cdd6f4}
        .md li::before{content:"•";color:#cba6f7;flex-shrink:0}
        .md label.todo{display:flex;gap:8px;align-items:center;cursor:default;padding:3px 0}
        .md label.todo::before{display:none}
        .md label.done{color:#6c7086;text-decoration:line-through}
        .md p{margin:.5em 0;line-height:1.8;color:#cdd6f4}
      `}</style>
      <div className="md" style={{ fontSize: 15, lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />
    </>
  );
}
