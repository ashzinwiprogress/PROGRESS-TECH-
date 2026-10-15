<?php
$pageTitle = 'Home';
$pageId = 'home';
include __DIR__ . '/includes/header.php';
?>
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <div class="kicker">Luxury Cyber Academy</div>
      <h1>PROGRESS TECH OFFICIAL</h1>
      <p class="lead">Explore the world of ethical hacking and cybersecurity. We train beginners to professionals in penetration testing, web development, Python, Linux, Termux, bug hunting and digital defense. Luxury glassy ocean motion. Principal-level craft.</p>
      <div class="btns">
        <a class="btn btn-cyan" href="academy.php">I don't know about cybersecurity — click me</a>
        <a class="btn btn-gold" href="about.php">Contact owner</a>
        <a class="btn btn-ghost" href="explore.php">Explore PROGRESS TECH HOME</a>
        <a class="btn btn-ghost" href="chatbot.php">Open chatbot</a>
      </div>
    </div>
    <div class="avatar-wrap tilt">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <div class="avatar-ring"></div>
      <img src="<?php echo PROFILE_IMAGE; ?>" alt="Progress Tech Official">
    </div>
  </div>
</section>
<div class="wave">
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" height="80">
    <path fill="rgba(0,229,255,0.18)" d="M0,40 C150,90 350,0 600,40 C850,80 1050,10 1200,40 L1200,120 L0,120 Z"></path>
    <path fill="rgba(212,175,55,0.12)" d="M1200,40 C1050,90 850,0 600,40 C350,80 150,10 0,40 L0,120 L1200,120 Z"></path>
  </svg>
</div>
<section class="section">
  <div class="wrap">
    <div class="kicker">The brand</div>
    <h2>About Progress Tech</h2>
    <p class="muted" style="max-width:78ch;margin-bottom:28px">Explore the world of hacking and cyber security with Progress Tech. We dive into ethical hacking, penetration testing, and the latest in cyber security. Learn about Black Hat, White Hat, and Gray Hat hacking. Stay informed on threats and protection strategies. Join us for insights and updates on the digital security landscape. Website building and training for beginners to pro. Python training. Linux mastery.</p>
    <div class="cards">
      <a class="card glass" href="academy.php?track=cybersecurity"><h3>Cybersecurity</h3><p>Defense, threats, CIA triad, SOC mindset.</p></a>
      <a class="card glass" href="academy.php?track=ethical"><h3>Ethical hacking</h3><p>White hat methodology and labs.</p></a>
      <a class="card glass" href="academy.php?track=pentest"><h3>Penetration testing</h3><p>Recon to report, legally and cleanly.</p></a>
      <a class="card glass" href="academy.php?track=web"><h3>Web development</h3><p>HTML to full-stack professional builds.</p></a>
      <a class="card glass" href="academy.php?track=python"><h3>Python scripts</h3><p>Automation, tooling and beginner to pro.</p></a>
      <a class="card glass" href="academy.php?track=termux"><h3>Termux & Bash</h3><p>Mobile Linux, shells and workflows.</p></a>
      <a class="card glass" href="academy.php?track=bug"><h3>Bug hunting</h3><p>Hunter programs, reports, responsible disclosure.</p></a>
      <a class="card glass" href="academy.php?track=hats"><h3>Hats & ethics</h3><p>Black, white, gray — law, ethics, careers.</p></a>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap glass" style="padding:36px">
    <div class="kicker">Training path</div>
    <h2>Beginner to principal</h2>
    <p class="muted">Linux fundamentals, networking, Python, web apps, vulnerability classes, pentest methodology, reporting and professional ethics. Tools are taught as defensive and authorized lab skills only.</p>
    <div class="btns" style="margin-top:20px">
      <a class="btn btn-cyan" href="contact-whatsapp.php">WhatsApp the owner</a>
      <a class="btn btn-gold" href="contact-email.php">Send via email</a>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
