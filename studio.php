<?php
$pageTitle = 'AI Studio';
$pageId = 'studio';
$hideChat = true;
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Multi-model AI laboratory</div>
    <h1>PROGRESS TECH AI Studio</h1>
    <p class="muted" style="margin:12px 0 26px">20+ live models. Chat, generate images, edit photos, scan code and build apps, and compose music. Everything runs through the Omegatech API grid.</p>

    <div class="tabs">
      <button class="tab active" data-tab="chat" type="button">Chat</button>
      <button class="tab" data-tab="image" type="button">Image</button>
      <button class="tab" data-tab="edit" type="button">Image Edit</button>
      <button class="tab" data-tab="code" type="button">Code / Files</button>
      <button class="tab" data-tab="music" type="button">Music</button>
    </div>

    <div class="pane" data-pane="chat">
      <div class="glass studio-box">
        <div class="chat-head">
          <strong>Chat with any model</strong>
          <div class="tiny">Gemini, GPT, Claude, DeepSeek, Llama and more</div>
        </div>
        <div class="chat-msgs" id="studioMsgs">
          <div class="bubble bot">Hello, I am PROGRESS TECH. Pick a model and ask anything about cyber, code, or tech.</div>
        </div>
        <div class="model-row">
          <select id="studioModel">
            <option value="gemini">Gemini (Gemini 3.1 Flash Lite)</option>
            <option value="gpt4mini">GPT-4o mini</option>
            <option value="chatgpt">ChatGPT v2</option>
            <option value="claude">Claude</option>
            <option value="deepai">Deep AI (multi)</option>
            <option value="hotbot">HotBot (GPT-5 class)</option>
            <option value="asyntai">Asyntai</option>
            <option value="chatbot">Claude Code bot</option>
            <option value="unlimited">Unlimited AI</option>
            <option value="perplexity">Perplexity</option>
            <option value="aicli">AICLI (multi)</option>
            <option value="wormgpt">WormGPT (education)</option>
            <option value="llama">Llama app builder (ZIP)</option>
          </select>
          <select id="studioSub" class="hidden"></select>
        </div>
        <form class="chat-form" id="studioChatForm">
          <input id="studioChatInput" placeholder="Ask PROGRESS TECH..." autocomplete="off">
          <button class="btn btn-cyan" type="submit">Send</button>
        </form>
      </div>
    </div>

    <div class="pane hidden" data-pane="image">
      <form class="form glass p-tool" id="imageForm">
        <h3>Text to image</h3>
        <p class="tiny">Returns a raw PNG you can view and download.</p>
        <label>Prompt</label>
        <textarea id="imagePrompt" required placeholder="A neon cyber ocean with a Progress Tech shield, cinematic"></textarea>
        <label>Engine</label>
        <select id="imageEngine">
          <option value="flux">Flux (raw PNG)</option>
          <option value="argen">Argen (flux2)</option>
        </select>
        <button class="btn btn-cyan" type="submit">Generate image</button>
        <div id="imageOut" class="tool-out"></div>
      </form>
    </div>

    <div class="pane hidden" data-pane="edit">
      <form class="form glass p-tool" id="editForm">
        <h3>AI image editor</h3>
        <p class="tiny">Upload a photo, describe the change, and get an edited raw PNG back.</p>
        <label>Upload image</label>
        <input type="file" id="editFile" accept="image/*" required>
        <label>What should change?</label>
        <textarea id="editPrompt" required placeholder="Make the sky ocean blue and add neon reflections"></textarea>
        <button class="btn btn-gold" type="submit">Edit image</button>
        <div id="editOut" class="tool-out"></div>
      </form>
    </div>

    <div class="pane hidden" data-pane="code">
      <form class="form glass p-tool" id="codeForm" enctype="multipart/form-data">
        <h3>Coding AI — build, scan and fix code</h3>
        <p class="tiny">Upload source files or a ZIP, or just describe an app. Small results return as code, big projects return as a ZIP download.</p>
        <label>Mode</label>
        <select name="mode">
          <option value="generate">Generate / build an app, website or system</option>
          <option value="analyze">Scan uploaded code and fix or improve it</option>
        </select>
        <label>Upload file or ZIP (optional)</label>
        <input type="file" name="file" accept=".zip,.txt,.md,.php,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.sh,.java,.c,.cpp,.cs,.rb,.go,.sql,.xml,.yml,.yaml,.rs">
        <label>Your request</label>
        <textarea name="prompt" placeholder="Build a movie streaming site with stream and download, or: find bugs in this code"></textarea>
        <button class="btn btn-cyan" type="submit">Run AI coder</button>
        <div id="codeOut" class="tool-out"></div>
      </form>
    </div>

    <div class="pane hidden" data-pane="music">
      <form class="form glass p-tool" id="musicForm">
        <h3>Music generator</h3>
        <p class="tiny">Describe a track. You get raw MP3 audio to play and download, plus lyrics.</p>
        <label>Describe your music</label>
        <textarea id="musicPrompt" required placeholder="An epic motivational cyber anthem for Progress Tech, electronic, uplifting"></textarea>
        <button class="btn btn-gold" type="submit">Generate music</button>
        <div id="musicOut" class="tool-out"></div>
        <div id="musicLyrics" class="tool-out"></div>
      </form>
    </div>
  </div>
</section>
<script src="js/studio.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
