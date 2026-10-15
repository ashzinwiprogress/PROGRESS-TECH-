<?php
$pageTitle = 'Contact Owner';
$pageId = 'about';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap hero-grid">
    <div>
      <div class="kicker">Owner dossier</div>
      <h1>PROGRESS TECH</h1>
      <p class="lead">Progress Tech Official is a cybersecurity and software training brand. We teach ethical hacking, penetration testing, web development, Python and Linux from beginner to professional. The mission is simple: make digital defense beautiful, practical and legal.</p>
      <ul class="muted" style="padding-left:18px;margin:18px 0">
        <li>Brand: PROGRESS TECH OFFICIAL</li>
        <li>Owner: PROGRESS TECH</li>
        <li>Focus: Ethical hacking, cyber defense, web, Python, Linux, Termux</li>
        <li>WhatsApp: +237 698 830 792</li>
        <li>Email: progresstech237@gmail.com</li>
        <li>YouTube: @progresstech12</li>
      </ul>
      <div class="btns">
        <a class="btn btn-cyan" href="contact-whatsapp.php">Contract via WhatsApp</a>
        <a class="btn btn-gold" href="contact-email.php">Send via email</a>
        <a class="btn btn-ghost" href="explore.php">Explore tools</a>
      </div>
    </div>
    <div class="avatar-wrap">
      <div class="avatar-ring"></div>
      <img src="<?php echo PROFILE_IMAGE; ?>" alt="Owner">
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
