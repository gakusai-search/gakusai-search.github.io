export function setupShareButton() {
  const shareBtn = document.querySelector<HTMLButtonElement>(".share-button");
  if (!shareBtn) return;

  if (!(shareBtn as any)._hasShareListener) {
    (shareBtn as any)._hasShareListener = true;
    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = url;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        alert("URLをコピーしました! 貼り付けて共有することができます。");
      } catch (e) {
        console.error("Failed to copy URL:", e);
      }
    });
  }
}

export function initShareButton() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupShareButton);
  } else {
    setupShareButton();
  }
  document.addEventListener("astro:page-load", setupShareButton);
}
