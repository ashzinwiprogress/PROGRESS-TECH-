<?php
$pageTitle = 'OTP inbox';
$pageId = 'virtual-number';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Step 3 · Live OTP</div>
    <h1>OTP inbox</h1>
    <p class="muted" style="margin:12px 0 28px;max-width:72ch">Copy the number, sign in on your platform, then come back. This page keeps pulling the newest SMS for this exact number.</p>
    <div class="vn-inbox">
      <div class="vn-selected glass" id="vnSelected"></div>
      <div class="vn-otp glass" id="vnOtp">
        <div class="kicker">Waiting for SMS</div>
        <div class="loader"></div>
      </div>
      <h3 style="margin:28px 0 12px">Message history</h3>
      <div class="vn-msgs" id="vnMsgs"></div>
    </div>
  </div>
</section>
<script>document.body.setAttribute("data-vn","inbox");</script>
<script src="js/virtual-number.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
