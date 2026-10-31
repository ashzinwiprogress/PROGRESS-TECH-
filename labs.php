<?php
$pageTitle = 'Labs';
$pageId = 'labs';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Defensive playground</div>
    <h1>Cyber labs</h1>
    <p class="muted" style="margin:12px 0 24px">In-browser training: password strength, hashing, headers, phishing awareness (spot fakes — we do not generate lure pages), Wi-Fi hygiene, secure coding and IR. Authorized education only.</p>
    <div class="cards">
      <a class="card glass" href="academy.php?track=cybersecurity"><h3>Notes</h3><p>Start with academy tracks, then use the Next.js /labs playground.</p></a>
      <a class="card glass" href="academy.php?track=vuln"><h3>Vuln classes</h3><p>XSS, SQLi, IDOR — defender view only.</p></a>
      <a class="card glass" href="terms.php"><h3>Terms</h3><p>No attacks on systems you do not own.</p></a>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
