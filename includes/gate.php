<?php if (!pto_followed() && empty($skipGate)): ?>
<div class="gate" id="followGate">
  <div class="gate-box glass">
    <img src="<?php echo PROFILE_IMAGE; ?>" alt="Progress Tech">
    <div class="kicker">Verified access</div>
    <h2>Follow PROGRESS TECH to enter</h2>
    <p class="muted" style="margin:12px 0 18px">Tap both buttons below. The system verifies automatically and unlocks the site. You must follow all channels.</p>
    <button class="btn btn-cyan gate-step" data-ch="wa" data-url="<?php echo WA_CHANNEL; ?>" type="button">Follow WhatsApp Channel</button>
    <button class="btn btn-gold gate-step" data-ch="yt" data-url="<?php echo YT_CHANNEL; ?>" type="button">Subscribe YouTube Channel</button>
    <p id="gateNotice" class="tiny" style="margin-top:16px;color:#ffd166"></p>
  </div>
</div>
<?php endif; ?>
