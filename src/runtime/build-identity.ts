declare const __JV_BUILD_SOURCE_COMMIT__: string | undefined;
declare const __JV_BUILD_SOURCE_MARKER__: string | undefined;

const FULL_GIT_SHA = /^[0-9a-f]{40}$/i;
const injectedCommit =
  typeof __JV_BUILD_SOURCE_COMMIT__ === "string"
    ? __JV_BUILD_SOURCE_COMMIT__.trim()
    : "DEV";
const injectedMarker =
  typeof __JV_BUILD_SOURCE_MARKER__ === "string"
    ? __JV_BUILD_SOURCE_MARKER__.trim()
    : "JV_BUILD_SOURCE:DEV";

export const JV_BUILD_SOURCE_COMMIT = FULL_GIT_SHA.test(injectedCommit)
  ? injectedCommit.toLowerCase()
  : "DEV";

export const JV_BUILD_SOURCE_LABEL =
  JV_BUILD_SOURCE_COMMIT === "DEV"
    ? "DEV"
    : JV_BUILD_SOURCE_COMMIT.slice(0, 12);

export const JV_BUILD_SOURCE_MARKER = injectedMarker;

export function installJvBuildIdentity(root: ParentNode = document): void {
  const metrics = root.querySelector<HTMLElement>(".primary-metrics");
  if (metrics === null) {
    throw new Error("JV build identity requires the debug metrics panel.");
  }

  const card = document.createElement("div");
  card.dataset["jvBuildMarker"] = JV_BUILD_SOURCE_MARKER;

  const term = document.createElement("dt");
  term.textContent = "Build source";

  const value = document.createElement("dd");
  value.dataset["buildSource"] = "";
  value.textContent = JV_BUILD_SOURCE_LABEL;
  value.title = JV_BUILD_SOURCE_COMMIT;

  card.append(term, value);
  metrics.append(card);
  document.documentElement.dataset["jvBuildSource"] = JV_BUILD_SOURCE_COMMIT;
}
