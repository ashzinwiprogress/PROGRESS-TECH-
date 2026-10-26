<?php
$pageTitle = 'Choose platform';
$pageId = 'virtual-number';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Step 2</div>
    <h1>Choose the platform</h1>
    <p class="muted" style="margin:12px 0 28px;max-width:70ch">You will sign this number into the app you pick. After that, open the inbox and the exact OTP for that platform is pulled live.</p>
    <div class="vn-selected glass" id="vnSelected"></div>
    <div class="vn-platforms" id="vnPlatforms"></div>
  </div>
</section>
<script>document.body.setAttribute("data-vn","platform");</script>
<script src="js/virtual-number.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
