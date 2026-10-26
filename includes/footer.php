<?php if (empty($hideChat)): ?>
<button class="chat-fab" id="chatFab" type="button" title="PROGRESS TECH Chat">PT</button>
<div class="chat-panel glass" id="chatPanel">
  <div class="chat-head">
    <div>
      <strong>PROGRESS TECH</strong>
      <div class="tiny">Owner: PROGRESS TECH · Cyber & code assistant</div>
    </div>
    <button class="btn btn-ghost" id="closeChat" type="button">Close</button>
  </div>
  <div class="chat-msgs" id="chatMsgs">
    <div class="bubble bot">I am PROGRESS TECH. Ask about cybersecurity, ethical hacking, Termux, Python, web development, or pentesting. Switch models below.</div>
  </div>
  <div class="model-row">
    <select id="chatModel">
      <option value="gemini">Gemini</option>
      <option value="gpt4mini">GPT-4o mini</option>
      <option value="chatgpt">ChatGPT v2</option>
      <option value="claude">Claude</option>
      <option value="deepai">Deep AI</option>
      <option value="hotbot">HotBot (GPT-5)</option>
      <option value="asyntai">Asyntai</option>
      <option value="chatbot">Claude Code bot</option>
      <option value="unlimited">Unlimited AI</option>
      <option value="perplexity">Perplexity</option>
      <option value="aicli">AICLI</option>
      <option value="wormgpt">WormGPT (education)</option>
      <option value="llama">Llama app builder (ZIP)</option>
    </select>
    <select id="chatSub" class="hidden"></select>
  </div>
  <div class="model-row">
    <a class="btn btn-ghost" href="studio.php" style="width:100%">Open full AI Studio (image, edit, code, music)</a>
  </div>
  <form class="chat-form" id="chatForm">
    <input id="chatInput" placeholder="Ask PROGRESS TECH..." autocomplete="off">
    <button class="btn btn-cyan" type="submit">Send</button>
  </form>
</div>
<?php endif; ?>
<footer class="footer">
  <div>
    <strong>PROGRESS TECH OFFICIAL</strong>
    <p class="tiny">Ethical hacking · Cybersecurity · Web · Python · Linux</p>
  </div>
  <div class="tiny">© <?php echo date('Y'); ?> Progress Tech · Cameroon</div>
</footer>
<?php include __DIR__ . '/gate.php'; ?>
<script src="js/main.js"></script>
</body>
</html>
