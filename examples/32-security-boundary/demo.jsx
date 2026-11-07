/** @jsx elementBuilder */

function getBlockedAttributeResult(label, operation) {
  try {
    operation();
    return `${label}: unexpectedly accepted`;
  } catch (error) {
    return `${label}: blocked (${error.message})`;
  }
}

function SecurityBoundaryExample() {
  const sampleUserText = "<img src=x onerror=alert(1)>";
  const checks = [
    getBlockedAttributeResult("Inline event attribute", () => new ElementBuilder("button").setAttributes({ onclick: "alert(1)" })),
    getBlockedAttributeResult("JavaScript URL", () => elementBuilder("a", { href: "javascript:alert(1)" }, "Unsafe link")),
    getBlockedAttributeResult("Data URL", () => elementBuilder("img", { src: "data:text/html,unsafe" })),
    getBlockedAttributeResult("srcdoc", () => new ElementBuilder("iframe").setAttributes({ srcdoc: "<script>alert(1)<\/script>" })),
    getBlockedAttributeResult("Raw style attribute", () => new ElementBuilder("div").setAttributes({ style: "color: red" })),
    getBlockedAttributeResult("Script element", () => new ElementBuilder("script")),
  ];

  let textPreview;

  return (
    <div>
      <p>These unsafe builder operations are rejected before attributes reach the DOM:</p>
      <ul>{checks.map((result, index) => <li key={index}>{result}</li>)}</ul>
      <h4>Untrusted content stays text</h4>
      {textPreview = <pre>{sampleUserText}</pre>}
      <button type="button" onClick={() => textPreview.setText(sampleUserText)}>Render the sample string as text</button>
      <p>Event handlers must be functions passed through event props or <code>setEvents()</code>.</p>
      <button type="button" onClick={() => textPreview.setText("A trusted function handler ran.")}>Run a function event handler</button>
    </div>
  );
}

elementBuilder(document.getElementById("security-example"), null, <SecurityBoundaryExample />);