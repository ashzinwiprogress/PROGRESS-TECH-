<?php
$pageTitle = 'WhatsApp Contract';
$pageId = 'whatsapp';
include __DIR__ . '/includes/header.php';
$sent = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim(isset($_POST['wa_name']) ? $_POST['wa_name'] : '');
    $number = preg_replace('/[^0-9+]/', '', isset($_POST['wa_number']) ? $_POST['wa_number'] : '');
    $msg = trim(isset($_POST['wa_message']) ? $_POST['wa_message'] : '');
    $body = "PROGRESS TECH OFFICIAL\nFrom: $name\nNumber: $number\n\n$msg";
    $url = 'https://wa.me/' . OWNER_WHATSAPP . '?text=' . rawurlencode($body);
    header('Location: ' . $url);
    exit;
}
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Liquid glass comms</div>
    <h1>WhatsApp the owner</h1>
    <p class="muted" style="margin:12px 0 24px">Luxury tech systems style. Enter your WhatsApp with country code, your WhatsApp name, then the message. Send opens the owner number +237698830792.</p>
    <form class="form glass" style="padding:28px" method="post">
      <label>WhatsApp name</label>
      <input name="wa_name" required placeholder="Your WhatsApp name">
      <label>WhatsApp number with country code</label>
      <input name="wa_number" required placeholder="+2376XXXXXXXX">
      <label>Message to owner</label>
      <textarea name="wa_message" required placeholder="Write the message you want to send to the owner"></textarea>
      <button class="btn btn-cyan" type="submit">Send</button>
    </form>
    <p class="tiny" style="margin-top:16px">Also available: <a href="contact-email.php">send via email</a></p>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
