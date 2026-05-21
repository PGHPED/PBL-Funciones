/* =========================================================
   ¿Cuántos coches fabricar? — lógica de la presentación
   - Gráfica de la función a trozos (canvas, sin librerías)
   - Animaciones de aparición al hacer scroll
   - Barra de progreso + navegación lateral por puntos
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 1. La función a trozos ---------- */
  function beneficio(x) {
    if (x <= 100) return x * x + 20 * x - 900;        // tramo 1
    if (x < 150) return 21100 - 100 * x;              // tramo 2
    return -3 * x * x + 1200 * x - 106400;            // tramo 3
  }

  /* ---------- 2. Gráfica en canvas ---------- */
  var canvas = document.getElementById("chart");

  // Dominio y recorrido visibles en la gráfica
  var X_MIN = 0, X_MAX = 270;
  var Y_MIN = -2000, Y_MAX = 14500;

  // Puntos de datos a marcar
  var dataPoints = [
    { x: 50, y: 2600 },
    { x: 125, y: 8600 }
  ];
  // Puntos especiales (con etiqueta)
  var keyPoints = [
    { x: 100, y: 11100, label: "A", place: "up-left" },
    { x: 150, y: 6100, label: "B", place: "down" },
    { x: 200, y: 13600, label: "C", place: "up" }
  ];

  function drawChart() {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    // Lienzo nítido en pantallas de alta densidad
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    var W = rect.width, H = rect.height;
    var mL = 62, mR = 22, mT = 26, mB = 46;
    var pw = W - mL - mR;   // ancho del área de dibujo
    var ph = H - mT - mB;   // alto del área de dibujo

    function px(x) { return mL + (x - X_MIN) / (X_MAX - X_MIN) * pw; }
    function py(y) { return mT + (Y_MAX - y) / (Y_MAX - Y_MIN) * ph; }

    var FONT = '12px "Inter", Helvetica, Arial, sans-serif';

    /* --- Cuadrícula --- */
    ctx.lineWidth = 1;
    ctx.font = FONT;
    ctx.fillStyle = "#666";

    // verticales (cada 50 coches)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (var gx = 0; gx <= X_MAX; gx += 50) {
      var cx = px(gx);
      ctx.strokeStyle = "#ededed";
      ctx.beginPath(); ctx.moveTo(cx, mT); ctx.lineTo(cx, mT + ph); ctx.stroke();
      ctx.fillText(String(gx), cx, mT + ph + 8);
    }

    // horizontales (cada 2000 €)
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var gy = Y_MIN; gy <= Y_MAX; gy += 2000) {
      var cy = py(gy);
      ctx.strokeStyle = "#ededed";
      ctx.beginPath(); ctx.moveTo(mL, cy); ctx.lineTo(mL + pw, cy); ctx.stroke();
      ctx.fillText(formatEuro(gy), mL - 8, cy);
    }

    /* --- Ejes (x=0 y y=0) más marcados --- */
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1.4;
    // eje x (y = 0)
    ctx.beginPath(); ctx.moveTo(mL, py(0)); ctx.lineTo(mL + pw, py(0)); ctx.stroke();
    // eje y (x = 0)
    ctx.beginPath(); ctx.moveTo(px(0), mT); ctx.lineTo(px(0), mT + ph); ctx.stroke();

    /* --- Curva de la función --- */
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.beginPath();
    var started = false;
    for (var x = X_MIN; x <= X_MAX; x += 0.5) {
      var y = beneficio(x);
      var X = px(x), Y = py(y);
      if (!started) { ctx.moveTo(X, Y); started = true; }
      else { ctx.lineTo(X, Y); }
    }
    ctx.stroke();

    /* --- Corte con el eje X (≈267 coches) --- */
    var xCorte = 267.3;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px(xCorte), py(0), 5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("≈267", px(xCorte), py(0) + 9);

    /* --- Puntos de datos pequeños --- */
    ctx.fillStyle = "#0a0a0a";
    dataPoints.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 4, 0, Math.PI * 2);
      ctx.fill();
    });

    /* --- Puntos clave A, B, C --- */
    keyPoints.forEach(function (p) {
      var X = px(p.x), Y = py(p.y);
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.arc(X, Y, 6, 0, Math.PI * 2);
      ctx.fill();

      // etiqueta
      ctx.fillStyle = "#0a0a0a";
      ctx.font = 'bold 15px "Inter", Helvetica, Arial, sans-serif';
      var txt = p.label + " (" + p.x + ", " + formatEuro(p.y) + ")";
      if (p.place === "up") {
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(txt, X, Y - 12);
      } else if (p.place === "up-left") {
        ctx.textAlign = "right"; ctx.textBaseline = "bottom";
        ctx.fillText(txt, X - 10, Y - 6);
      } else { // down
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(txt, X, Y + 12);
      }
    });

    /* --- Títulos de los ejes --- */
    ctx.fillStyle = "#0a0a0a";
    ctx.font = '600 12px "Inter", Helvetica, Arial, sans-serif';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("Coches fabricados (x)", mL + pw, H - 4);

    ctx.save();
    ctx.translate(14, mT + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Beneficio en € (y)", 0, 0);
    ctx.restore();
  }

  // 14000 -> "14.000" ; -2000 -> "−2.000"
  function formatEuro(n) {
    var neg = n < 0;
    var s = Math.abs(n).toString();
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "−" : "") + s;
  }

  /* ---------- 3. Animaciones de aparición ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 4. Navegación lateral por puntos ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll(".section[data-nav]"));
  var dotnav = document.getElementById("dotnav");

  sections.forEach(function (sec) {
    var btn = document.createElement("button");
    btn.setAttribute("aria-label", "Ir a " + sec.dataset.nav);
    var lab = document.createElement("span");
    lab.className = "dot-label";
    lab.textContent = sec.dataset.nav;
    btn.appendChild(lab);
    btn.addEventListener("click", function () {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    dotnav.appendChild(btn);
  });
  var dots = Array.prototype.slice.call(dotnav.querySelectorAll("button"));

  /* ---------- 5. Barra de progreso + punto activo ---------- */
  var progressBar = document.getElementById("progressBar");
  var ticking = false;

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + "%";

    // Sección más centrada en la pantalla
    var center = scrollTop + window.innerHeight / 2;
    var activeIdx = 0, best = Infinity;
    sections.forEach(function (sec, i) {
      var top = sec.offsetTop;
      var mid = top + sec.offsetHeight / 2;
      var dist = Math.abs(mid - center);
      if (dist < best) { best = dist; activeIdx = i; }
    });
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === activeIdx); });

    // Puntos en blanco cuando la sección activa es oscura
    dotnav.classList.toggle("on-dark", sections[activeIdx].classList.contains("section--dark"));

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- 6. Redibujar la gráfica al cambiar tamaño ---------- */
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawChart, 150);
  });

  /* ---------- Arranque ---------- */
  drawChart();
  onScroll();
})();
