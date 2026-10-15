export function setupShareButton() {
  const shareBtns = document.querySelectorAll<HTMLButtonElement>(".share-button");
  if (shareBtns.length === 0) return;

  shareBtns.forEach((shareBtn) => {
    if (!(shareBtn as any)._hasShareListener) {
      (shareBtn as any)._hasShareListener = true;
      shareBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof (window as any).openShareModal === "function") {
          (window as any).openShareModal();
        } else {
          // fallback if modal script hasn't loaded yet
          const backdrop = document.getElementById("share-modal-backdrop");
          if (backdrop) {
            backdrop.classList.add("is-open");
            backdrop.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
          }
        }
      });
    }
  });
}

export function initShareButton() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupShareButton);
  } else {
    setupShareButton();
  }
  document.addEventListener("astro:page-load", setupShareButton);
}
