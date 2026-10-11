/* Source-owned, optional presentation enhancement. One read-only identity query,
 * manual refresh and an in-memory appearance preference. No execution calls,
 * analytics, storage, automatic polling or external network requests.
 * SPDX-License-Identifier: Apache-2.0 */
(function () {
  "use strict";
  const appearance = document.getElementById("appearance");
  const appearanceLabel = document.getElementById("appearance-label");
  const refresh = document.getElementById("refresh-identity");
  const state = document.getElementById("identity-state");
  const detail = document.getElementById("identity-detail");
  const revision = document.getElementById("identity-revision");

  appearance.hidden = false;
  appearance.addEventListener("click", function () {
    const light = document.documentElement.dataset.surface !== "light";
    document.documentElement.dataset.surface = light ? "light" : "dark";
    appearanceLabel.textContent = light ? "Dark appearance" : "Light appearance";
    appearance.setAttribute("aria-label", light ? "Use dark appearance" : "Use light appearance");
  });

  async function readIdentity() {
    if (refresh.disabled) return;
    refresh.disabled = true;
    state.textContent = "Checking source binding";
    detail.textContent = "Reading this container’s locally checked build identity.";
    revision.hidden = true;
    revision.removeAttribute("href");
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 5000);
    try {
      const response = await fetch("./api/build-info", { method: "GET", credentials: "omit", cache: "no-store", redirect: "error", signal: controller.signal });
      if (!response.ok) throw new Error("Identity unavailable");
      const body = await response.text();
      if (body.length > 65536) throw new Error("Identity limit");
      const value = JSON.parse(body);
      const sha = value.source_revision;
      if (value.schema !== "szl.build-info/v1" || value.source_repository !== "szl-holdings/holographic-unify" ||
          typeof sha !== "string" || !/^[a-f0-9]{40}$/.test(sha) || value.state !== "LOCAL_BYTES_VERIFIED" ||
          value.build?.state !== "OBSERVED" || value.build?.revision !== sha || value.receipt_minted !== false ||
          value.signature !== "UNSIGNED-honest") throw new Error("Identity contract mismatch");
      state.textContent = "Local source bytes verified";
      detail.textContent = "The container’s files match its deployment document. This is unsigned source identity, not a model-quality or execution-authority verdict.";
      revision.textContent = "Source " + sha;
      revision.href = "https://github.com/szl-holdings/holographic-unify/tree/" + sha;
      revision.hidden = false;
    } catch (_) {
      state.textContent = "Source binding unavailable";
      detail.textContent = "A valid local source binding was not returned. The source declarations remain readable; this page does not substitute a success claim.";
    } finally {
      clearTimeout(timer);
      refresh.disabled = false;
    }
  }
  refresh.hidden = false;
  refresh.addEventListener("click", readIdentity);
  readIdentity();
}());
