/* =========================================================
   StudyFlow — Landing Page Script (vanilla JavaScript)
   ========================================================= */

/* ---------------------------------------------------------
   0. EDIT HERE — contact placeholders
   Ganti nilai di bawah ini dengan data kontak asli kamu.
   Seluruh link & teks kontak di halaman akan ikut berubah.
   --------------------------------------------------------- */
const CONFIG = {
  email: "halo@studyflow.example", // ganti dengan email kamu
  whatsapp: "6281234567890", // format internasional tanpa +, contoh: 6281234567890
  whatsappLabel: "+62 812-3456-7890",
  address: "[Alamat sekolah / kota Anda]",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
  youtube: "https://www.youtube.com/",
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Apply contact config
     --------------------------------------------------------- */
  function applyContactConfig() {
    const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
      "Halo StudyFlow, saya tertarik untuk mencoba StudyFlow!"
    )}`;

    $$('[data-contact="email"]').forEach((el) => (el.textContent = CONFIG.email));
    $$('[data-contact="email-link"]').forEach((el) => (el.href = `mailto:${CONFIG.email}`));
    $$('[data-contact="wa"]').forEach((el) => (el.textContent = CONFIG.whatsappLabel));
    $$('[data-contact="wa-link"]').forEach((el) => (el.href = waLink));
    $$('[data-contact="address"]').forEach((el) => (el.textContent = CONFIG.address));
    ["instagram", "tiktok", "youtube"].forEach((key) => {
      $$(`[data-contact="${key}"]`).forEach((el) => (el.href = CONFIG[key]));
    });
  }

  /* ---------------------------------------------------------
     2. Footer year
     --------------------------------------------------------- */
  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     3. Header: shadow on scroll + mobile navigation
     --------------------------------------------------------- */
  const header = $("#header");
  const nav = $("#main-nav");
  const toggle = $("#nav-toggle");

  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }

  function setNav(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
    document.body.style.overflow = open ? "hidden" : "";
  }

  function initNav() {
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });

    toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));

    // close menu after choosing a link
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));

    // Esc closes the menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        toggle.focus();
      }
    });

    // click outside closes the menu
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setNav(false);
      }
    });

    // reset when resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && nav.classList.contains("open")) setNav(false);
    });
  }

  /* ---------------------------------------------------------
     4. Scroll spy — highlight active nav link
     --------------------------------------------------------- */
  function initScrollSpy() {
    const links = $$(".nav-link");
    const map = new Map();
    links.forEach((link) => {
      const target = $(link.getAttribute("href"));
      if (target) map.set(target, link);
    });
    if (!("IntersectionObserver" in window)) return;

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
        // choose the first visible section in DOM order
        const current = Array.from(map.keys()).find((sec) => visible.has(sec));
        links.forEach((l) => l.classList.remove("active"));
        if (current) map.get(current).classList.add("active");
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    map.forEach((_, sec) => io.observe(sec));
  }

  /* ---------------------------------------------------------
     5. Reveal on scroll
     --------------------------------------------------------- */
  function initReveal() {
    const items = $$(".reveal");

    // stagger siblings inside the same parent
    const groups = new Map();
    items.forEach((el) => {
      const p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach((list) => list.forEach((el, i) => el.style.setProperty("--d", `${Math.min(i, 5) * 0.09}s`)));

    if (!("IntersectionObserver" in window) || prefersReduced) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target;
            el.classList.add("in");
            io.unobserve(el);
            // once revealed, drop the helper class so hover effects use their own transitions
            const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
            setTimeout(() => {
              el.classList.remove("reveal", "in");
              el.style.removeProperty("--d");
            }, 800 + delay * 1000);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     6. Dashboard preview tabs (accessible, arrow-key support)
     --------------------------------------------------------- */
  function initTabs() {
    const tabs = $$(".ptab");
    const panels = $$(".app-panel");

    function activate(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute("aria-controls");
        p.classList.toggle("active", on);
        p.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          activate(next, true);
        }
      });
    });
  }

  /* ---------------------------------------------------------
     7. Interactive task list in preview
     --------------------------------------------------------- */
  function initTasks() {
    const list = $("#task-list");
    if (!list) return;
    const countEl = $("#task-count");
    const barEl = $("#task-bar");

    function update() {
      const boxes = $$("input[type=checkbox]", list);
      const done = boxes.filter((b) => b.checked).length;
      countEl.textContent = done;
      barEl.style.width = `${(done / boxes.length) * 100}%`;
    }

    list.addEventListener("change", (e) => {
      const box = e.target;
      if (!(box instanceof HTMLInputElement)) return;
      const task = box.closest(".task");
      task.classList.toggle("done", box.checked);
      const tag = $(".tag", task);
      if (box.checked) {
        tag.dataset.prev = JSON.stringify({ cls: tag.className, txt: tag.textContent });
        tag.className = "tag tag-green";
        tag.textContent = "Selesai";
      } else if (tag.dataset.prev) {
        const prev = JSON.parse(tag.dataset.prev);
        tag.className = prev.cls;
        tag.textContent = prev.txt;
      } else {
        tag.className = "tag tag-blue";
        tag.textContent = "Aktif";
      }
      update();
    });
    update();
  }

  /* ---------------------------------------------------------
     8. Sample calendar (current month, with example deadlines)
     --------------------------------------------------------- */
  function initCalendar() {
    const grid = $("#cal-grid");
    const title = $("#cal-title");
    if (!grid) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    title.textContent = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    // example deadline offsets from today
    const marks = { 1: "mark-red", 3: "mark-amber", 6: "mark-blue", 9: "mark-violet" };
    const markByDay = {};
    Object.entries(marks).forEach(([offset, cls]) => {
      const d = today + Number(offset);
      if (d <= daysInMonth) markByDay[d] = cls;
    });

    const frag = document.createDocumentFragment();
    for (let i = 0; i < firstDow; i++) frag.appendChild(document.createElement("span"));
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("span");
      cell.textContent = d;
      if (d === today) {
        cell.className = "today";
        cell.title = "Hari ini";
      } else if (markByDay[d]) {
        cell.className = markByDay[d];
        cell.title = "Contoh deadline";
      } else if (d < today) {
        cell.className = "muted-day";
      }
      frag.appendChild(cell);
    }
    grid.appendChild(frag);
  }

  /* ---------------------------------------------------------
     9. Pricing: monthly / yearly toggle
     --------------------------------------------------------- */
  function initBilling() {
    const buttons = $$(".bill-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.billing;
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        $$(".price strong[data-monthly]").forEach((el) => (el.textContent = el.dataset[mode]));
        $$(".price-note[data-monthly]").forEach((el) => (el.textContent = el.dataset[mode]));
      });
    });
  }

  /* ---------------------------------------------------------
     10. CTA buttons pre-select plan in the contact form
     --------------------------------------------------------- */
  function initPlanLinks() {
    const select = $("#f-paket");
    $$("[data-plan]").forEach((el) => {
      el.addEventListener("click", () => {
        const plan = el.dataset.plan;
        const option = Array.from(select.options).find((o) => o.textContent === plan);
        if (option) select.value = option.value;
      });
    });
  }

  /* ---------------------------------------------------------
     11. Contact form — validation + opens email client (mailto)
     --------------------------------------------------------- */
  function initForm() {
    const form = $("#contact-form");
    const status = $("#form-status");
    if (!form) return;

    function setError(input, message) {
      const field = input.closest(".field");
      const err = $(`.err[data-for="${input.id}"]`, field);
      field.classList.toggle("invalid", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (err) err.textContent = message || "";
    }

    function validate() {
      const nama = $("#f-nama");
      const email = $("#f-email");
      let ok = true;

      if (nama.value.trim().length < 2) {
        setError(nama, "Mohon isi nama lengkapmu.");
        ok = false;
      } else setError(nama, "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        setError(email, "Masukkan alamat email yang valid, contoh: nama@email.com.");
        ok = false;
      } else setError(email, "");

      return ok;
    }

    ["#f-nama", "#f-email"].forEach((sel) => {
      $(sel).addEventListener("input", () => {
        if ($(sel).closest(".field").classList.contains("invalid")) validate();
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent = "";
      status.style.color = "";

      if (!validate()) {
        const firstInvalid = $(".field.invalid input", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const subject = `Minat StudyFlow — ${data.get("paket")}`;
      const body = [
        "Halo tim StudyFlow,",
        "",
        "Saya tertarik untuk mencoba StudyFlow. Berikut data saya:",
        `Nama   : ${data.get("nama")}`,
        `Email  : ${data.get("email")}`,
        `Kelas  : ${data.get("kelas")}`,
        `Paket  : ${data.get("paket")}`,
        "",
        `Pesan  : ${data.get("pesan") || "-"}`,
        "",
        "Terima kasih!",
      ].join("\n");

      status.textContent = "Terima kasih! Aplikasi emailmu akan terbuka dengan pesan yang sudah terisi. Tinggal tekan kirim.";
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  applyContactConfig();
  setYear();
  initNav();
  initScrollSpy();
  initReveal();
  initTabs();
  initTasks();
  initCalendar();
  initBilling();
  initPlanLinks();
  initForm();
})();
