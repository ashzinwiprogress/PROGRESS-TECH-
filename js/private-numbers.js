(function () {
  var root = document.getElementById("pnApp");
  if (!root) return;

  var API = "api/private-number.php";
  var state = { catalog: [], currency: "USD", account: null, numbers: [], selected: null, messages: [], country: "", duration: "", type: "", q: "", busy: false };
  var timers = [];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(amount, currency) {
    if (amount === null || amount === undefined || amount === "") return "—";
    var cur = String(currency || "USD").toUpperCase();
    var value = Number(amount);
    if (!isFinite(value)) return "—";
    var text = value % 1 === 0 ? String(value) : value.toFixed(2);
    return cur === "USD" ? "$" + text : text + " " + cur;
  }

  function when(value) {
    if (!value) return "—";
    var ts = Date.parse(String(value).replace(" ", "T"));
    if (isNaN(ts)) return String(value);
    return new Date(ts).toLocaleString();
  }

  function durationLabel(key) {
    var map = { oneWeek: "1 week", oneMonth: "1 month", threeMonths: "3 months", sixMonths: "6 months", oneYear: "12 months" };
    if (map[key]) return map[key];
    return String(key || "").replace(/([A-Z])/g, " $1").replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function request(url, options) {
    return fetch(url, options || {}).then(function (res) {
      return res.json().catch(function () { return { ok: false, error: "Unexpected response." }; });
    });
  }

  function notice(text, bad) {
    var el = document.getElementById("pnNotice");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("hidden", !text);
    el.classList.toggle("pn-notice-bad", !!bad);
  }

  function renderStats() {
    var el = document.getElementById("pnStats");
    if (!el) return;
    el.innerHTML =
      '<div><strong>' + (state.catalog.length || "—") + '</strong><span class="tiny"> countries</span></div>' +
      '<div><strong>' + (state.numbers.length || "—") + '</strong><span class="tiny"> your numbers</span></div>' +
      '<div><strong>' + (state.account && state.account.balance !== null ? money(state.account.balance, state.account.currency || state.currency) : "—") + '</strong><span class="tiny"> balance</span></div>' +
      '<div class="tiny">Codes refresh every 10s</div>';
  }

  function filtered() {
    var term = state.q.trim().toLowerCase();
    if (!term) return state.catalog;
    return state.catalog.filter(function (c) {
      return c.name.toLowerCase().indexOf(term) !== -1 || c.code.toLowerCase().indexOf(term) !== -1;
    });
  }

  function activeCountry() {
    for (var i = 0; i < state.catalog.length; i++) {
      if (state.catalog[i].code === state.country) return state.catalog[i];
    }
    return null;
  }

  function renderCountries() {
    var box = document.getElementById("pnCountries");
    if (!box) return;
    var list = filtered();
    if (!list.length) {
      box.innerHTML = '<p class="muted">No country matches that search.</p>';
      return;
    }
    box.innerHTML = list.map(function (c) {
      return '<button type="button" class="pn-country' + (state.country === c.code ? " active" : "") + '" data-code="' + esc(c.code) + '">' +
        '<span class="vn-flag">' + esc(c.flag || c.code.slice(0, 2)) + '</span>' +
        '<span class="pn-country-meta"><strong>' + esc(c.name) + '</strong>' +
        '<span class="tiny">' + c.packages.length + ' packages' +
        (c.freeCount ? " · " + c.freeCount + " free" : "") +
        (c.cheapest !== null ? " · from " + money(c.cheapest, c.currency) : "") +
        '</span></span></button>';
    }).join("");
  }

  function renderPackages() {
    var box = document.getElementById("pnPackages");
    var buy = document.getElementById("pnBuy");
    if (!box) return;
    var country = activeCountry();
    if (!country) {
      box.innerHTML = "";
      if (buy) buy.disabled = true;
      return;
    }
    var keys = country.packages.map(function (p) { return p.key; });
    if (keys.indexOf(state.duration) === -1) state.duration = keys[0] || "";
    box.innerHTML =
      '<div class="kicker" style="margin-top:18px">Package</div><div class="pn-chips">' +
      country.packages.map(function (p) {
        return '<button type="button" class="pn-chip' + (state.duration === p.key ? " active" : "") + '" data-duration="' + esc(p.key) + '">' +
          '<strong>' + esc(durationLabel(p.key)) + '</strong><span class="tiny">' + (p.free ? "Free" : money(p.price, p.currency)) + '</span></button>';
      }).join("") +
      '</div><div class="kicker" style="margin-top:18px">Line type</div><div class="pn-chips">' +
      [["", "Auto"], ["voip", "VoIP"], ["non_voip", "Mobile"]].map(function (pair) {
        return '<button type="button" class="pn-chip' + (state.type === pair[0] ? " active" : "") + '" data-type="' + esc(pair[0]) + '">' +
          '<strong>' + esc(pair[1]) + '</strong></button>';
      }).join("") + "</div>";
    if (buy) buy.disabled = state.busy || !state.duration;
  }

  function renderNumbers() {
    var box = document.getElementById("pnNumbers");
    if (!box) return;
    if (!state.numbers.length) {
      box.innerHTML = '<p class="muted">No private numbers yet. Request one on the left.</p>';
      return;
    }
    box.innerHTML = state.numbers.map(function (n) {
      var active = state.selected && String(state.selected.id) === String(n.id);
      return '<button type="button" class="pn-number' + (active ? " active" : "") + '" data-id="' + esc(n.id) + '">' +
        '<span class="vn-flag">' + esc(n.flag || n.code || "#") + '</span>' +
        '<span class="pn-country-meta"><strong class="vn-phone">' + esc(n.number) + '</strong>' +
        '<span class="tiny">' + esc(n.country || n.code) + " · " + esc(n.type || "line") + " · expires " + esc(when(n.expires)) + '</span></span>' +
        '<span class="vn-pill' + (String(n.status).toLowerCase() === "active" ? " vn-pill-ok" : "") + '">' + esc(n.status || "active") + '</span></button>';
    }).join("");
  }

  function renderDetail() {
    var box = document.getElementById("pnDetail");
    if (!box) return;
    if (!state.selected) {
      box.innerHTML = state.numbers.length ? '<p class="muted">Select a number to read its messages.</p>' : "";
      return;
    }
    var n = state.selected;
    var html = '<div class="vn-selected glass" style="margin-top:18px">' +
      '<span class="vn-flag">' + esc(n.flag || n.code) + '</span>' +
      '<div><div class="tiny">' + esc(n.country || n.code) + " · " + esc(n.type || "line") + '</div>' +
      '<strong class="vn-phone">' + esc(n.number) + '</strong></div>' +
      '<div class="btns"><button class="btn btn-cyan" type="button" data-copy="' + esc(n.number) + '">Copy number</button>' +
      '<button class="btn btn-ghost" type="button" data-refresh="1">Refresh SMS</button></div></div>';
    if (n.email) {
      html += '<div class="pn-email"><span class="tiny">Private inbox</span>' +
        '<div class="pn-email-row"><strong>' + esc(n.email) + '</strong>' +
        '<button class="btn btn-ghost" type="button" data-copy="' + esc(n.email) + '">Copy email</button></div></div>';
    }
    html += '<h4 style="margin:18px 0 10px">Live messages</h4><div class="vn-msgs">';
    if (!state.messages.length) {
      html += '<p class="muted">No messages yet. Use the number on the service you are verifying, then it appears here.</p>';
    } else {
      html += state.messages.map(function (m) {
        return '<article class="glass vn-msg"><div class="vn-msg-head"><strong>' + esc(m.sender || "SMS") + '</strong>' +
          '<span class="tiny">' + esc(when(m.time)) + '</span></div>' +
          (m.code ? '<div class="vn-mini-code">' + esc(m.code) + '</div>' : "") +
          (m.message ? '<p class="muted">' + esc(m.message) + '</p>' : "") +
          "</article>";
      }).join("");
    }
    html += "</div>";
    box.innerHTML = html;
  }

  function render() {
    renderStats();
    renderCountries();
    renderPackages();
    renderNumbers();
    renderDetail();
  }

  function loadCatalog() {
    return request(API + "?action=catalog").then(function (data) {
      if (!data.ok) {
        notice(data.error || "Could not load the catalog.", true);
        state.catalog = [];
        return;
      }
      state.catalog = data.countries || [];
      state.currency = data.currency || "USD";
      notice("");
      if (!state.country) {
        var first = state.catalog.filter(function (c) { return c.packages && c.packages.length; })[0] || state.catalog[0];
        if (first) {
          state.country = first.code;
          state.duration = first.packages[0] ? first.packages[0].key : "";
        }
      }
    }).catch(function () {
      notice("Live catalog is unavailable right now.", true);
    });
  }

  function loadAccount() {
    return request(API + "?action=account").then(function (data) {
      if (data.ok) state.account = data.account || null;
    }).catch(function () {});
  }

  function loadNumbers() {
    return request(API + "?action=numbers").then(function (data) {
      if (!data.ok) return;
      state.numbers = data.items || [];
      if (state.selected) {
        var match = state.numbers.filter(function (n) { return String(n.id) === String(state.selected.id); })[0];
        state.selected = match || state.numbers[0] || null;
      } else {
        state.selected = state.numbers[0] || null;
      }
    }).catch(function () {});
  }

  function loadMessages(id) {
    if (!id) {
      state.messages = [];
      return Promise.resolve();
    }
    return request(API + "?action=messages&id=" + encodeURIComponent(id)).then(function (data) {
      if (data.ok) state.messages = data.items || [];
    }).catch(function () {});
  }

  function refreshMessages() {
    if (!state.selected) return;
    loadMessages(state.selected.id).then(renderDetail);
  }

  function copy(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { notice("Copied."); }, function () { window.prompt("Copy", text); });
    } else {
      window.prompt("Copy", text);
    }
  }

  function buy() {
    if (state.busy || !state.country || !state.duration) return;
    state.busy = true;
    renderPackages();
    notice("");
    request(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "buy", country: state.country, duration: state.duration, type: state.type })
    }).then(function (data) {
      if (!data.ok) {
        notice(data.error || "Could not get a number right now.", true);
        return;
      }
      notice("Private number ready: " + data.number.number + " (expires " + when(data.number.expires) + ").");
      return Promise.all([loadNumbers(), loadAccount()]).then(function () {
        return loadMessages(data.number.id).then(render);
      });
    }).catch(function () {
      notice("Network error. Try again.", true);
    }).then(function () {
      state.busy = false;
      renderPackages();
    });
  }

  root.addEventListener("click", function (e) {
    var target = e.target.closest("[data-code],[data-duration],[data-type],[data-id],[data-copy],[data-refresh]");
    if (!target) return;
    if (target.hasAttribute("data-code")) { state.country = target.getAttribute("data-code"); render(); return; }
    if (target.hasAttribute("data-duration")) { state.duration = target.getAttribute("data-duration"); render(); return; }
    if (target.hasAttribute("data-type")) { state.type = target.getAttribute("data-type"); render(); return; }
    if (target.hasAttribute("data-id")) {
      var id = target.getAttribute("data-id");
      state.selected = state.numbers.filter(function (n) { return String(n.id) === String(id); })[0] || null;
      state.messages = [];
      render();
      if (state.selected) loadMessages(state.selected.id).then(renderDetail);
      return;
    }
    if (target.hasAttribute("data-copy")) { copy(target.getAttribute("data-copy")); return; }
    if (target.hasAttribute("data-refresh")) refreshMessages();
  });

  var search = document.getElementById("pnSearch");
  if (search) {
    search.addEventListener("input", function (e) { state.q = e.target.value; renderCountries(); });
  }
  var buyBtn = document.getElementById("pnBuy");
  if (buyBtn) buyBtn.addEventListener("click", buy);

  loadCatalog().then(function () {
    render();
    return Promise.all([loadAccount(), loadNumbers()]);
  }).then(function () {
    render();
    if (state.selected) loadMessages(state.selected.id).then(renderDetail);
    timers.push(setInterval(function () {
      if (state.selected && document.visibilityState === "visible") loadMessages(state.selected.id).then(renderDetail);
    }, 10000));
  });
})();
