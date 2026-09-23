const revealPage = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add("is-revealed"));
  });
};

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("is-revealed");
} else {
  revealPage();
}
