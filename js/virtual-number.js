(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function timeAgo(ts) {
    if (!ts) return "just now";
    var s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + "s ago";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }

  function freshness(ts) {
    var age = Date.now() - (ts || 0);
    if (age < 30 * 60 * 1000) return { label: "Fresh", cls: "vn-pill vn-pill-ok" };
    if (age < 6 * 3600 * 1000) return { label: "Active", cls: "vn-pill vn-pill-gold" };
    return { label: "Standby", cls: "vn-pill" };
  }

  function qs(obj) {
    var p = [];
    Object.keys(obj).forEach(function (k) {
      if (obj[k] != null && obj[k] !== "") p.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
    });
    return p.join("&");
  }

  function copyText(text, el) {
    function done() {
      if (!el) return;
      var old = el.textContent;
      el.textContent = "Copied";
      setTimeout(function () { el.textContent = old; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        window.prompt("Copy", text);
      });
    } else {
      window.prompt("Copy", text);
    }
  }

  var PLATFORMS = [
    { id: "whatsapp", name: "WhatsApp", hint: "WhatsApp and WhatsApp Business" },
    { id: "facebook", name: "Facebook", hint: "Facebook login codes" },
    { id: "instagram", name: "Instagram", hint: "Instagram SMS codes" },
    { id: "google", name: "Google", hint: "Google / Gmail verification" },
    { id: "telegram", name: "Telegram", hint: "Telegram login codes" },
    { id: "microsoft", name: "Microsoft", hint: "Microsoft account codes" },
    { id: "apple", name: "Apple", hint: "Apple ID codes" },
    { id: "huawei", name: "Huawei", hint: "Huawei / MeeTime codes" },
    { id: "paypal", name: "PayPal", hint: "PayPal security codes" },
    { id: "viber", name: "Viber", hint: "Viber activation codes" },
    { id: "bigo", name: "BIGO LIVE", hint: "BIGO live codes" },
    { id: "twitter", name: "X / Twitter", hint: "X and Twitter codes" },
    { id: "alipay", name: "Alipay", hint: "Alipay / AliSMS codes" },
    { id: "tiktok", name: "TikTok", hint: "TikTok SMS codes" },
    { id: "amazon", name: "Amazon", hint: "Amazon verification" },
    { id: "discord", name: "Discord", hint: "Discord SMS codes" },
    { id: "snapchat", name: "Snapchat", hint: "Snapchat codes" },
    { id: "linkedin", name: "LinkedIn", hint: "LinkedIn codes" },
    { id: "uber", name: "Uber", hint: "Uber verification" },
    { id: "netflix", name: "Netflix", hint: "Netflix codes" },
    { id: "mexc", name: "MEXC", hint: "MEXC exchange codes" },
    { id: "other", name: "Any platform", hint: "Show every SMS for this number" }
  ];

  var page = document.body.getAttribute("data-vn");
  if (page === "countries") {
    var data = null;
    var country = "";
    var q = "";
    var stats = document.getElementById("vnStats");
    var list = document.getElementById("vnCountries");
    var nums = document.getElementById("vnNumbers");
    var search = document.getElementById("vnSearch");
    var err = document.getElementById("vnErr");
    var refresh = document.getElementById("vnRefresh");

    function render() {
      if (!data) return;
      stats.innerHTML =
        "<div><strong>" + data.total + "</strong><span class=\"tiny\"> live numbers</span></div>" +
        "<div><strong>" + data.countries.length + "</strong><span class=\"tiny\"> countries</span></div>" +
        "<div class=\"tiny\">Auto-refresh every 12s · " + timeAgo(data.updated) + "</div>";
      var term = q.trim().toLowerCase();
      var countries = data.countries.filter(function (c) {
        return !term || c.name.toLowerCase().indexOf(term) !== -1;
      });
      list.innerHTML = countries.map(function (c) {
        return "<button type=\"button\" class=\"vn-country glass" + (country === c.name ? " active" : "") + "\" data-country=\"" + esc(c.name) + "\">" +
          "<span class=\"vn-flag\">" + esc(c.flag || "") + "</span>" +
          "<span class=\"vn-country-meta\"><strong>" + esc(c.name) + "</strong><span class=\"tiny\">" + c.count + " numbers · " + timeAgo(c.latest) + "</span></span>" +
          (c.hot ? "<span class=\"vn-pill vn-pill-ok\">Hot</span>" : "") +
          "</button>";
      }).join("") || "<p class=\"muted\">No countries match that search.</p>";
      var numbers = (data.numbersByCountry && data.numbersByCountry[country]) || [];
      nums.innerHTML = numbers.map(function (n) {
        var f = freshness(n.latest);
        var href = "virtual-number-platform.php?" + qs({ country: n.country, number: n.number, flag: n.flag || "" });
        return "<a class=\"vn-number glass\" href=\"" + href + "\">" +
          "<div class=\"vn-number-top\"><span class=\"vn-flag\">" + esc(n.flag || "") + "</span><span class=\"" + f.cls + "\">" + f.label + "</span></div>" +
          "<strong class=\"vn-phone\">" + esc(n.number) + "</strong>" +
          "<span class=\"tiny\">" + esc(n.country) + " · " + timeAgo(n.latest) + " · " + n.messageCount + " SMS</span>" +
          (n.senders && n.senders.length ? "<span class=\"tiny vn-senders\">" + esc(n.senders.slice(0, 4).join(" · ")) + "</span>" : "") +
          "</a>";
      }).join("") || (country ? "<p class=\"muted\">No live numbers for this country yet.</p>" : "<p class=\"muted\">Select a country to see live numbers.</p>");
    }

    function load() {
      fetch("api/temp-number.php?action=overview", { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) throw new Error(d.error || "Could not load numbers");
          data = d;
          err.textContent = "";
          if (!country || !d.countries.some(function (c) { return c.name === country; })) {
            var hot = d.countries.filter(function (c) { return c.hot; })[0] || d.countries[0];
            country = hot ? hot.name : "";
          }
          render();
        })
        .catch(function (e) {
          err.textContent = e.message || "Live feed is unavailable.";
        });
    }

    list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-country]");
      if (!btn) return;
      country = btn.getAttribute("data-country");
      render();
    });
    if (search) search.addEventListener("input", function () { q = search.value; render(); });
    if (refresh) refresh.addEventListener("click", load);
    load();
    setInterval(load, 12000);
  }

  if (page === "platform") {
    var params = new URLSearchParams(location.search);
    var number = params.get("number") || "";
    var country = params.get("country") || "";
    var flag = params.get("flag") || "";
    var grid = document.getElementById("vnPlatforms");
    var selected = document.getElementById("vnSelected");
    if (!number) {
      if (selected) selected.innerHTML = "<p class=\"err\">No number selected.</p><a class=\"btn btn-cyan\" href=\"virtual-number.php\">Back to countries</a>";
      return;
    }
    if (selected) {
      selected.innerHTML =
        "<span class=\"vn-flag\">" + esc(flag) + "</span><div><div class=\"tiny\">" + esc(country) + "</div><strong class=\"vn-phone\">" + esc(number) + "</strong></div>" +
        "<a class=\"btn btn-ghost\" href=\"virtual-number.php\">Change number</a>";
    }
    if (grid) {
      grid.innerHTML = PLATFORMS.map(function (p) {
        var href = "virtual-number-inbox.php?" + qs({ country: country, number: number, flag: flag, platform: p.id });
        return "<a class=\"card glass vn-plat\" href=\"" + href + "\"><div class=\"vn-plat-mark\">" + p.name.slice(0, 2).toUpperCase() + "</div><h3>" + p.name + "</h3><p>" + p.hint + "</p></a>";
      }).join("");
    }
  }

  if (page === "inbox") {
    var params = new URLSearchParams(location.search);
    var number = params.get("number") || "";
    var country = params.get("country") || "";
    var flag = params.get("flag") || "";
    var platform = params.get("platform") || "other";
    var plat = PLATFORMS.filter(function (p) { return p.id === platform; })[0];
    var platformName = plat ? plat.name : "Any platform";
    var selected = document.getElementById("vnSelected");
    var otpBox = document.getElementById("vnOtp");
    var msgs = document.getElementById("vnMsgs");
    var copyNum = document.getElementById("vnCopyNum");
    if (!number) {
      if (otpBox) otpBox.innerHTML = "<p class=\"err\">No number selected.</p><a class=\"btn btn-cyan\" href=\"virtual-number.php\">Choose a number</a>";
      return;
    }
    var baseQs = qs({ country: country, number: number, flag: flag });
    if (selected) {
      selected.innerHTML =
        "<span class=\"vn-flag\">" + esc(flag) + "</span><div><div class=\"tiny\">" + esc(country) + " · " + esc(platformName) + "</div><strong class=\"vn-phone\">" + esc(number) + "</strong></div>" +
        "<div class=\"btns\">" +
        "<button class=\"btn btn-cyan\" type=\"button\" id=\"vnCopyNum\">Copy number</button>" +
        "<a class=\"btn btn-ghost\" href=\"virtual-number-platform.php?" + baseQs + "\">Change platform</a>" +
        "<a class=\"btn btn-gold\" href=\"virtual-number.php\">Change number</a></div>";
      copyNum = document.getElementById("vnCopyNum");
    }
    if (copyNum) copyNum.addEventListener("click", function () { copyText(number, copyNum); });

    function paint(d) {
      var latest = d.latest;
      if (latest && latest.otp) {
        otpBox.className = "vn-otp glass vn-otp-ready";
        otpBox.innerHTML =
          "<div class=\"kicker\">Code received</div><div class=\"vn-code\">" + esc(latest.otp) + "</div>" +
          "<p class=\"tiny\">" + esc(latest.sender || platformName) + " · " + timeAgo(latest.ts) + "</p>" +
          "<p class=\"muted\" style=\"margin-top:8px\">" + esc(latest.message || "") + "</p>" +
          "<div class=\"btns\" style=\"margin-top:16px\">" +
          "<button class=\"btn btn-cyan\" type=\"button\" id=\"vnCopyCode\">Copy code</button>" +
          "<button class=\"btn btn-ghost\" type=\"button\" id=\"vnPull\">Check again</button></div>";
        var cc = document.getElementById("vnCopyCode");
        if (cc) cc.addEventListener("click", function () { copyText(latest.otp, cc); });
      } else {
        otpBox.className = "vn-otp glass";
        otpBox.innerHTML =
          "<div class=\"kicker\">Waiting for SMS</div><div class=\"loader\"></div>" +
          "<p class=\"muted\">Use the copied number on " + platformName + ", then return. Fresh codes appear here automatically.</p>" +
          "<button class=\"btn btn-ghost\" type=\"button\" id=\"vnPull\" style=\"margin-top:12px\">Pull now</button>";
      }
      var pull = document.getElementById("vnPull");
      if (pull) pull.addEventListener("click", load);
      msgs.innerHTML = (d.messages || []).map(function (m) {
        return "<article class=\"glass vn-msg\"><div class=\"vn-msg-head\"><strong>" + esc(m.sender || "SMS") + "</strong><span class=\"tiny\">" + esc(m.time || "") + " · " + timeAgo(m.ts) + "</span></div>" +
          (m.otp ? "<div class=\"vn-mini-code\">" + esc(m.otp) + "</div>" : "") +
          "<p class=\"muted\">" + esc(m.message || "") + "</p></article>";
      }).join("") || "<p class=\"muted\">No " + platformName + " SMS on this number yet. Sign in, then wait a few seconds.</p>";
    }

    function load() {
      fetch("api/temp-number.php?action=inbox&" + qs({ number: number, platform: platform }), { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) throw new Error(d.error || "Inbox unavailable");
          paint(d);
        })
        .catch(function (e) {
          otpBox.innerHTML = "<p class=\"err\">" + (e.message || "Could not pull SMS.") + "</p><button class=\"btn btn-ghost\" type=\"button\" id=\"vnPull\">Pull now</button>";
          var pull = document.getElementById("vnPull");
          if (pull) pull.addEventListener("click", load);
        });
    }
    load();
    setInterval(load, 5000);
  }
})();
