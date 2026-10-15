function ptoEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function addMsg(text, who) {
  var box = document.getElementById("studioMsgs");
  if (!box) return { remove: function () {} };
  var div = document.createElement("div");
  div.className = "bubble " + who;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}
function addDownload(label, href) {
  var box = document.getElementById("studioMsgs");
  if (!box) return;
  var a = document.createElement("a");
  a.className = "btn btn-cyan";
  a.href = href;
  a.download = "";
  a.textContent = label;
  a.style.marginTop = "8px";
  box.appendChild(a);
  box.scrollTop = box.scrollHeight;
}

(function () {
  var tabs = document.querySelectorAll("[data-tab]");
  var panes = document.querySelectorAll("[data-pane]");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.remove("active"); });
      panes.forEach(function (p) { p.classList.add("hidden"); });
      t.classList.add("active");
      var pane = document.querySelector('[data-pane="' + t.getAttribute("data-tab") + '"]');
      if (pane) pane.classList.remove("hidden");
    });
  });

  var chatModel = document.getElementById("studioModel");
  var chatSub = document.getElementById("studioSub");
  var SUB = {
    deepai: [["deepseek-v3.2", "DeepSeek V3.2"], ["gemini-2.5-flashlite", "Gemini 2.5 Flash Lite"], ["gemma-4", "Gemma 4"], ["llama-3.3-70b-instruct", "Llama 3.3 70B"], ["gpt-oss-120b", "GPT-OSS 120B"], ["gpt-5-nano", "GPT-5 Nano"], ["GPT-5", "GPT-5"]],
    hotbot: [["gpt-5", "GPT-5"], ["claude-3.5-sonnet-20241022", "Claude 3.5 Sonnet"], ["gemini-2.5-pro", "Gemini 2.5 Pro"], ["deepseek-r1", "DeepSeek R1"], ["o3-mini", "o3-mini"], ["grok-3", "Grok 3"]],
    aicli: [["gpt", "GPT"], ["claude", "Claude"], ["gemini", "Gemini"], ["mistral", "Mistral"], ["copilot", "Copilot"], ["chatgpt_5_5", "ChatGPT 5.5"], ["chatgpt_5_3", "ChatGPT 5.3"]]
  };
  function fillSub() {
    if (!chatModel || !chatSub) return;
    var list = SUB[chatModel.value];
    chatSub.innerHTML = "";
    if (!list) { chatSub.classList.add("hidden"); return; }
    chatSub.classList.remove("hidden");
    list.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o[0];
      opt.textContent = o[1];
      chatSub.appendChild(opt);
    });
  }
  if (chatModel) { chatModel.addEventListener("change", fillSub); fillSub(); }

  var chatForm = document.getElementById("studioChatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("studioChatInput");
      var text = input.value.trim();
      if (!text) return;
      addMsg(text, "user");
      input.value = "";
      var thinking = addMsg("PROGRESS TECH is thinking...", "bot");
      fetch("api/ai.php?action=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: text, model: chatModel.value, sub: chatSub ? chatSub.value : "" })
      }).then(function (r) { return r.json(); }).then(function (d) {
        thinking.remove();
        addMsg(d.reply || "No response.", "bot");
        if (d.zip) addDownload("Download ZIP", d.zip);
      }).catch(function () { thinking.remove(); addMsg("Connection issue. Try again.", "bot"); });
    });
  }

  var imageForm = document.getElementById("imageForm");
  if (imageForm) {
    imageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var prompt = document.getElementById("imagePrompt").value.trim();
      var engine = document.getElementById("imageEngine").value;
      var out = document.getElementById("imageOut");
      out.innerHTML = '<p class="muted">Generating image... please wait.</p>';
      var fd = new FormData();
      fd.append("prompt", prompt);
      fd.append("engine", engine);
      fetch("api/ai.php?action=image", { method: "POST", body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.ok && d.url) {
            out.innerHTML = '<p class="ok">' + d.reply + '</p><img class="result-img" src="' + d.url + '"><a class="btn btn-cyan" download href="' + d.url + '">Download PNG</a>';
          } else {
            out.innerHTML = '<p class="err">' + (d.reply || "Failed") + '</p>';
          }
        }).catch(function () { out.innerHTML = '<p class="err">Connection issue.</p>'; });
    });
  }

  var editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var prompt = document.getElementById("editPrompt").value.trim();
      var file = document.getElementById("editFile").files[0];
      var out = document.getElementById("editOut");
      if (!file) { out.innerHTML = '<p class="err">Upload an image first.</p>'; return; }
      out.innerHTML = '<p class="muted">Editing image... please wait.</p>';
      var fd = new FormData();
      fd.append("prompt", prompt);
      fd.append("image", file);
      fetch("api/ai.php?action=edit", { method: "POST", body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.ok && d.url) {
            out.innerHTML = '<p class="ok">' + d.reply + '</p><img class="result-img" src="' + d.url + '"><a class="btn btn-cyan" download href="' + d.url + '">Download PNG</a>';
          } else {
            out.innerHTML = '<p class="err">' + (d.reply || "Failed") + '</p>';
          }
        }).catch(function () { out.innerHTML = '<p class="err">Connection issue.</p>'; });
    });
  }
})();

(function () {
  var codeForm = document.getElementById("codeForm");
  if (codeForm) {
    codeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var out = document.getElementById("codeOut");
      out.innerHTML = '<p class="muted">Working on your code... this can take up to a minute.</p>';
      var fd = new FormData(codeForm);
      fetch("api/ai.php?action=code", { method: "POST", body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var html = '<p class="ok">' + (d.reply || "") + "</p>";
          if (d.zip) html += '<a class="btn btn-cyan" download href="' + d.zip + '">Download ZIP</a>';
          if (d.reply) html += '<pre class="code-out">' + escapeHtml(d.reply) + "</pre>";
          out.innerHTML = html;
        }).catch(function () { out.innerHTML = '<p class="err">Connection issue.</p>'; });
    });
  }

  var musicForm = document.getElementById("musicForm");
  if (musicForm) {
    musicForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var prompt = document.getElementById("musicPrompt").value.trim();
      var out = document.getElementById("musicOut");
      var lyricsBox = document.getElementById("musicLyrics");
      out.innerHTML = '<p class="muted">Composing your track... waiting for the studio.</p>';
      lyricsBox.innerHTML = "";
      fetch("api/ai.php?action=music", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "prompt=" + encodeURIComponent(prompt)
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d.ok || !d.taskId) { out.innerHTML = '<p class="err">' + (d.reply || "Failed") + "</p>"; return; }
        out.innerHTML = '<p class="muted">' + d.reply + "  (0s)</p>";
        var tries = 0;
        var timer = setInterval(function () {
          tries++;
          var secs = tries * 6;
          out.querySelector("p").textContent = "Generating music... " + secs + "s (usually 60-120s)";
          fetch("api/ai.php?action=music_status&taskId=" + encodeURIComponent(d.taskId))
            .then(function (r) { return r.json(); })
            .then(function (s) {
              if (s.status === "done" && s.url) {
                clearInterval(timer);
                var html = '<p class="ok">' + (s.title ? escapeHtml(s.title) : "Your track") + (s.duration ? " · " + s.duration + "s" : "") + "</p>";
                html += '<audio controls src="' + s.url + '" style="width:100%"></audio>';
                html += '<a class="btn btn-cyan" download target="_blank" rel="noopener" href="' + s.url + '">Download MP3</a>';
                out.innerHTML = html;
                if (s.lyrics) lyricsBox.innerHTML = "<h3>Lyrics</h3><pre class=\"code-out\">" + escapeHtml(s.lyrics) + "</pre>";
              } else if (s.status === "failed" || s.status === "error") {
                clearInterval(timer);
                out.innerHTML = '<p class="err">Music generation failed. Try again.</p>';
              } else if (tries > 40) {
                clearInterval(timer);
                out.innerHTML = '<p class="err">Timed out. Try again.</p>';
              }
            }).catch(function () {});
        }, 6000);
      }).catch(function () { out.innerHTML = '<p class="err">Connection issue.</p>'; });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
})();
