<?php
$pageTitle = 'Free private numbers';
$pageId = 'private-numbers';
include __DIR__ . '/includes/header.php';
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Private lines</div>
    <h1>Free private numbers</h1>
    <p class="muted" style="margin:12px 0 28px;max-width:74ch">Provision a private number you own, keep it for the package duration, and read the SMS and the bundled private email inbox that arrive on it. Free packages cost nothing; paid packages come straight out of your provider wallet.</p>
    <div class="pn" id="pnApp">
      <div class="vn-bar glass" id="pnStats"><div class="tiny">Loading...</div></div>
      <p class="pn-notice glass hidden" id="pnNotice"></p>
      <div class="pn-steps">
        <div class="pn-step glass">
          <div class="kicker">Step 1</div>
          <h3>Pick country and package</h3>
          <div class="searchbar" style="margin:14px 0">
            <input id="pnSearch" placeholder="Search country or code..." aria-label="Search country">
          </div>
          <div class="pn-country-list" id="pnCountries"></div>
          <div id="pnPackages"></div>
          <button class="btn btn-cyan" type="button" id="pnBuy" style="margin-top:20px" disabled>Get free private number</button>
          <p class="tiny" style="margin-top:10px">Every request is charged against your provider wallet. Free packages cost 0.</p>
        </div>
        <div class="pn-step glass">
          <div class="kicker">Step 2</div>
          <h3>Your private numbers</h3>
          <div class="pn-number-list" id="pnNumbers"></div>
          <div id="pnDetail"></div>
        </div>
      </div>
    </div>
  </div>
</section>
<script src="js/private-numbers.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
