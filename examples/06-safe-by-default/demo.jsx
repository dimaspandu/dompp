/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

const app = document.getElementById("app");

const safe = (
  <a
    href="https://example.com"
    target="_blank"
    style={{ color: "blue", textDecoration: "underline" }}
    onClick={(e) => e.preventDefault()}
  >
    Safe link
  </a>
);

app.setChildren(safe);

// These would throw (left commented):
// <button onClick="alert(1)" />
// <iframe srcdoc="<script>alert(1)</script>" />
// <div style="color:red" />
// <a href="javascript:alert(1)" />
