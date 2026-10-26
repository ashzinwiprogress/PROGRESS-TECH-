<?php
$pageTitle = 'Free Virtual Numbers';
$pageId = 'virtual-number';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Live SMS inbox</div>
    <h1>Free virtual numbers</h1>
    <p class="muted" style="margin:12px 0 28px;max-width:72ch">Pick a live country. The system keeps pulling the newest numbers as they appear. Choose a number, pick the platform you are signing in to, copy the number, then come back for the exact OTP.</p>
    <div class="vn" data-ready="1">
      <div class="vn-bar glass" id="vnStats">
        <div class="tiny">Loading live numbers...</div>
      </div>
      <div class="searchbar">
        <input id="vnSearch" placeholder="Search country...">
        <button class="btn btn-ghost" type="button" id="vnRefresh">Refresh now</button>
      </div>
      <p class="err" id="vnErr"></p>
      <div class="vn-split">
        <div>
          <h3 style="margin-bottom:12px">1. Choose a country</h3>
          <div class="vn-countries" id="vnCountries"></div>
        </div>
        <div>
          <h3 style="margin-bottom:12px">2. Pick a fresh number</h3>
          <div class="vn-numbers" id="vnNumbers"></div>
        </div>
      </div>
    </div>
  </div>
</section>
<script>document.body.setAttribute("data-vn","countries");</script>
<script src="js/virtual-number.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
