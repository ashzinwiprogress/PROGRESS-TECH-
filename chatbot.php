<?php
$pageTitle = 'PROGRESS TECH Chatbot';
$pageId = 'chatbot';
$hideChat = true;
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Assistant</div>
    <h1>PROGRESS TECH chatbot</h1>
    <p class="muted" style="margin-bottom:20px">Owner: PROGRESS TECH. Helps with cybersecurity, ethical hacking, pentesting, Termux, Python, web and lab-safe tips. Gemini for chat. Llama to generate app files as a ZIP.</p>
    <div class="glass" style="height:min(74vh,760px);display:flex;flex-direction:column;overflow:hidden">
      <div class="chat-head">
        <div>
          <strong>PROGRESS TECH</strong>
          <div class="tiny">Gemini chat · Llama app builder</div>
        </div>
      </div>
      <div class="chat-msgs" id="chatMsgs">
        <div class="bubble bot">Welcome. I am PROGRESS TECH. Ask for notes, Termux commands, Python snippets, or switch to Llama to generate a starter app ZIP.</div>
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
        <a class="btn btn-ghost" href="studio.php" style="width:100%">Image, image edit, code and music tools</a>
      </div>
      <form class="chat-form" id="chatForm">
        <input id="chatInput" placeholder="Message PROGRESS TECH..." autocomplete="off">
        <button class="btn btn-cyan" type="submit">Send</button>
      </form>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
