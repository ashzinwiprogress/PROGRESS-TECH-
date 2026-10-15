(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  var gate = document.getElementById("followGate");
  if (gate) {
    document.documentElement.style.overflow = "hidden";
    var notice = document.getElementById("gateNotice");
    var steps = gate.querySelectorAll(".gate-step");
    function readState() {
      try { return JSON.parse(localStorage.getItem("pto_gate") || "{}"); } catch (e) { return {}; }
    }
    function saveState(s) {
      try { localStorage.setItem("pto_gate", JSON.stringify(s)); } catch (e) {}
    }
    function autoVerify() {
      var s = readState();
      if (s.wa && s.yt) {
        document.cookie = "pto_followed=1;path=/;max-age=" + 60 * 60 * 24 * 365;
        notice.textContent = "Verified. Welcome to PROGRESS TECH.";
        setTimeout(function () {
          gate.classList.add("hidden");
          document.documentElement.style.overflow = "";
        }, 700);
        return true;
      }
      if (s.wa && !s.yt) notice.textContent = "You are almost there. Now click the YouTube channel to subscribe.";
      else if (s.yt && !s.wa) notice.textContent = "You are almost there. Now click the WhatsApp channel to follow.";
      return false;
    }
    steps.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var s = readState();
        s[btn.getAttribute("data-ch")] = true;
        saveState(s);
        window.open(btn.getAttribute("data-url"), "_blank", "noopener");
        if (!autoVerify()) {
          setTimeout(autoVerify, 1500);
        }
      });
    });
    autoVerify();
  }

  var fab = document.getElementById("chatFab");
  var panel = document.getElementById("chatPanel");
  var closeChat = document.getElementById("closeChat");
  if (fab && panel) {
    fab.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }
  if (closeChat && panel) {
    closeChat.addEventListener("click", function () {
      panel.classList.remove("open");
    });
  }

  var chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", sendChat);
  }
})();

function appendBubble(text, who) {
  var box = document.getElementById("chatMsgs");
  if (!box) return;
  var div = document.createElement("div");
  div.className = "bubble " + who;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

var PTO_SUB = {
  deepai: [["deepseek-v3.2", "DeepSeek V3.2"], ["gemini-2.5-flashlite", "Gemini 2.5 Flash Lite"], ["gemma-4", "Gemma 4"], ["llama-3.3-70b-instruct", "Llama 3.3 70B"], ["gpt-oss-120b", "GPT-OSS 120B"], ["gpt-5-nano", "GPT-5 Nano"], ["GPT-5", "GPT-5"]],
  hotbot: [["gpt-5", "GPT-5"], ["claude-3.5-sonnet-20241022", "Claude 3.5 Sonnet"], ["gemini-2.5-pro", "Gemini 2.5 Pro"], ["deepseek-r1", "DeepSeek R1"], ["o3-mini", "o3-mini"], ["grok-3", "Grok 3"]],
  aicli: [["gpt", "GPT"], ["claude", "Claude"], ["gemini", "Gemini"], ["mistral", "Mistral"], ["copilot", "Copilot"]]
};

function ptoFillSub() {
  var m = document.getElementById("chatModel");
  var s = document.getElementById("chatSub");
  if (!m || !s) return;
  var list = PTO_SUB[m.value];
  s.innerHTML = "";
  if (!list) { s.classList.add("hidden"); return; }
  s.classList.remove("hidden");
  list.forEach(function (o) {
    var opt = document.createElement("option");
    opt.value = o[0];
    opt.textContent = o[1];
    s.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var m = document.getElementById("chatModel");
  if (m) { m.addEventListener("change", ptoFillSub); ptoFillSub(); }
});

function sendChat(e) {
  e.preventDefault();
  var input = document.getElementById("chatInput");
  var model = document.getElementById("chatModel");
  var sub = document.getElementById("chatSub");
  var text = input.value.trim();
  if (!text) return;
  appendBubble(text, "user");
  input.value = "";
  appendBubble("PROGRESS TECH is thinking...", "bot");
  fetch("api/ai.php?action=chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "chat", message: text, model: model.value, sub: sub ? sub.value : "" })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var msgs = document.getElementById("chatMsgs");
      if (msgs && msgs.lastChild) msgs.removeChild(msgs.lastChild);
      appendBubble(data.reply || "No response.", "bot");
      if (data.zip) {
        var a = document.createElement("a");
        a.href = data.zip;
        a.className = "btn btn-cyan";
        a.style.marginTop = "8px";
        a.textContent = "Download ZIP";
        a.download = "";
        msgs.appendChild(a);
      }
    })
    .catch(function () {
      var msgs = document.getElementById("chatMsgs");
      if (msgs && msgs.lastChild) msgs.removeChild(msgs.lastChild);
      appendBubble("Connection issue. Try again.", "bot");
    });
}
