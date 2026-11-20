/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

const app = document.getElementById("app");

const safe = (
  <div className="demo-surface component-surface">
    <h3>Safe by Default</h3>
    <p>Validated attributes and safe event handling</p>
    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <a
        href="https://example.com"
        target="_blank"
        className="action-button"
        style={{ textAlign: "center", textDecoration: "none" }}
        onClick={(e) => e.preventDefault()}
      >
        Safe https:// link
      </a>
      <button
        className="action-button"
        type="button"
        onClick={() => alert("Event handlers via onClick prop work safely")}
      >
        Safe onClick handler
      </button>
      <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b" }}>
        <strong>Rejected (would throw):</strong>
        <div>• <code>onClick="alert(1)"</code> — inline events disabled</div>
        <div>• <code>srcdoc</code> — disabled (accepts HTML)</div>
        <div>• <code>style="color:red"</code> — use setStyles() instead</div>
        <div>• <code>href="javascript:..."</code> — unsafe protocol blocked</div>
      </div>
    </div>
  </div>
);

app.setChildren(safe);