const COMPACT_UTILITY_QUERY =
  "(hover: none) and (pointer: coarse), (max-width: 620px)";
const DRAWER_ID = "product-utility-drawer";
const SCROLL_EPSILON_PX = 2;

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`JV utility drawer requires ${selector}.`);
  }
  return element;
}

export function installUtilityDrawer(): void {
  const scenePanel = requireElement<HTMLElement>(".scene-panel");
  const productToolbar = requireElement<HTMLElement>("[data-product-controls]");

  if (scenePanel.querySelector("[data-utility-drawer-toggle]") !== null) {
    throw new Error("JV utility drawer was installed more than once.");
  }

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "utility-drawer-toggle";
  toggle.setAttribute("data-utility-drawer-toggle", "");
  toggle.setAttribute("aria-controls", DRAWER_ID);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Otwórz opcje świata i widoku");
  toggle.title = "Opcje świata i widoku";

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.classList.add("utility-drawer-chevron");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("aria-hidden", "true");
  const chevronPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  chevronPath.setAttribute("d", "M6.5 9 12 14.5 17.5 9");
  chevron.append(chevronPath);
  toggle.append(chevron);

  productToolbar.id = DRAWER_ID;
  productToolbar.setAttribute("data-utility-drawer", "");

  const scroller = document.createElement("div");
  scroller.className = "utility-drawer-scroll";
  scroller.setAttribute("data-utility-drawer-scroll", "");
  while (productToolbar.firstChild !== null) {
    scroller.append(productToolbar.firstChild);
  }
  productToolbar.append(scroller);
  scenePanel.insertBefore(toggle, productToolbar);

  const compactMedia = window.matchMedia(COMPACT_UTILITY_QUERY);

  function enabled(): boolean {
    return compactMedia.matches;
  }

  function syncScrollAffordance(): void {
    if (!enabled()) {
      productToolbar.removeAttribute("data-utility-scroll-left");
      productToolbar.removeAttribute("data-utility-scroll-right");
      return;
    }

    const maxScrollLeft = Math.max(
      0,
      scroller.scrollWidth - scroller.clientWidth,
    );
    productToolbar.toggleAttribute(
      "data-utility-scroll-left",
      maxScrollLeft > SCROLL_EPSILON_PX &&
        scroller.scrollLeft > SCROLL_EPSILON_PX,
    );
    productToolbar.toggleAttribute(
      "data-utility-scroll-right",
      maxScrollLeft > SCROLL_EPSILON_PX &&
        scroller.scrollLeft < maxScrollLeft - SCROLL_EPSILON_PX,
    );
  }

  function setOpen(requestedOpen: boolean): void {
    const compact = enabled();
    const open = compact && requestedOpen;

    scenePanel.toggleAttribute("data-utility-drawer-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Zamknij opcje świata i widoku" : "Otwórz opcje świata i widoku",
    );

    if (
      compact &&
      !open &&
      document.activeElement instanceof Node &&
      productToolbar.contains(document.activeElement)
    ) {
      toggle.focus({ preventScroll: true });
    }

    if (compact) {
      productToolbar.setAttribute("aria-hidden", String(!open));
      productToolbar.toggleAttribute("inert", !open);
    } else {
      productToolbar.removeAttribute("aria-hidden");
      productToolbar.removeAttribute("inert");
    }

    window.requestAnimationFrame(syncScrollAffordance);
  }

  const onToggleClick = () => {
    setOpen(!scenePanel.hasAttribute("data-utility-drawer-open"));
  };

  const onToolbarClick = (event: Event) => {
    if (
      enabled() &&
      event.target instanceof Element &&
      event.target.closest(".product-choice") !== null
    ) {
      window.requestAnimationFrame(() => setOpen(false));
    }
  };

  const onDocumentPointerDown = (event: PointerEvent) => {
    if (
      !enabled() ||
      !scenePanel.hasAttribute("data-utility-drawer-open") ||
      !(event.target instanceof Node)
    ) {
      return;
    }

    const target = event.target;
    if (toggle.contains(target) || productToolbar.contains(target)) {
      return;
    }

    if (target instanceof Element) {
      if (
        target.closest(".scene-actions") !== null ||
        target.closest(".mobile-controls") !== null
      ) {
        setOpen(false);
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (
      event.code === "Escape" &&
      scenePanel.hasAttribute("data-utility-drawer-open")
    ) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const resetClosed = () => setOpen(false);
  const onScrollerScroll = () => syncScrollAffordance();
  const resizeObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => syncScrollAffordance())
    : null;

  toggle.addEventListener("click", onToggleClick);
  productToolbar.addEventListener("click", onToolbarClick);
  scroller.addEventListener("scroll", onScrollerScroll, { passive: true });
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  window.addEventListener("keydown", onKeyDown);
  compactMedia.addEventListener("change", resetClosed);
  document.addEventListener("fullscreenchange", resetClosed);
  resizeObserver?.observe(scroller);
  const scrollContent = scroller.firstElementChild;
  if (scrollContent instanceof HTMLElement) {
    resizeObserver?.observe(scrollContent);
  }

  setOpen(false);

  window.addEventListener(
    "pagehide",
    () => {
      toggle.removeEventListener("click", onToggleClick);
      productToolbar.removeEventListener("click", onToolbarClick);
      scroller.removeEventListener("scroll", onScrollerScroll);
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
      compactMedia.removeEventListener("change", resetClosed);
      document.removeEventListener("fullscreenchange", resetClosed);
      resizeObserver?.disconnect();
    },
    { once: true },
  );
}
