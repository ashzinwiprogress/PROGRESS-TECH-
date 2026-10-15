<?php
$pageTitle = 'Courses';
$pageId = 'courses';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Four academies in one</div>
    <h1>PROGRESS TECH campuses</h1>
    <p class="muted" style="margin:12px 0 28px">One luxury portal. Four professional tracks. Ocean glass motion throughout.</p>
    <div class="cards">
      <a class="card glass tilt liquid" href="academy.php?track=cybersecurity"><h3>01 · Cyber Defense</h3><p>CIA triad, threats, SOC thinking, protection strategy.</p></a>
      <a class="card glass tilt liquid" href="academy.php?track=ethical"><h3>02 · Ethical Ops</h3><p>White hat labs, hats explained, hunter programs.</p></a>
      <a class="card glass tilt liquid" href="academy.php?track=web"><h3>03 · Web Studio</h3><p>Build sites, then harden them. PHP, JS, UX.</p></a>
      <a class="card glass tilt liquid" href="academy.php?track=python"><h3>04 · Script Lab</h3><p>Python, Termux, Bash — beginner to principal.</p></a>
    </div>
    <div class="btns" style="margin-top:28px">
      <a class="btn btn-cyan" href="academy.php">Open all notes</a>
      <a class="btn btn-gold" href="explore.php">Live tools</a>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
