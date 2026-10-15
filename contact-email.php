<?php
$pageTitle = 'Email Owner';
$pageId = 'email';
include __DIR__ . '/includes/header.php';
$status = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var(isset($_POST['email']) ? $_POST['email'] : '', FILTER_SANITIZE_EMAIL);
    $phone = trim(isset($_POST['phone']) ? $_POST['phone'] : '');
    $message = trim(isset($_POST['message']) ? $_POST['message'] : '');
    $subject = 'PROGRESS TECH OFFICIAL — new message';
    $body = "From: $email\nPhone: $phone\n\n$message\n";
    $headers = "From: noreply@progresstech.local\r\nReply-To: $email\r\n";
    $ok = false;
    if (isset($_FILES['attach']) && $_FILES['attach']['error'] === UPLOAD_ERR_OK) {
        $tmp = $_FILES['attach']['tmp_name'];
        $fname = preg_replace('/[^A-Za-z0-9._-]/', '_', $_FILES['attach']['name']);
        $data = chunk_split(base64_encode(file_get_contents($tmp)));
        $boundary = md5(uniqid(time()));
        $headers = "From: noreply@progresstech.local\r\nReply-To: $email\r\nMIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        $body  = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n$body\r\n";
        $body .= "--$boundary\r\nContent-Type: application/octet-stream; name=\"$fname\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$fname\"\r\n\r\n$data\r\n--$boundary--";
    }
    $ok = @mail(OWNER_EMAIL, $subject, $body, $headers);
    $status = $ok
        ? 'Message sent to progresstech237@gmail.com'
        : 'Server mail() is limited on some hosts. If it fails, email the owner directly at progresstech237@gmail.com';
}
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">3D liquid mail</div>
    <h1>Send via email</h1>
    <p class="muted" style="margin:12px 0 24px">Ocean glass form. Add email, phone with country code, message, and upload an image or file from the corner control. Send goes to progresstech237@gmail.com.</p>
    <?php if ($status): ?><p class="ok"><?php echo pto_h($status); ?></p><?php endif; ?>
    <form class="form glass" style="padding:28px;position:relative" method="post" enctype="multipart/form-data">
      <label>Your email address</label>
      <input type="email" name="email" required placeholder="you@example.com">
      <label>Phone number with country code</label>
      <input name="phone" required placeholder="+2376XXXXXXXX">
      <label>Message</label>
      <textarea name="message" required placeholder="Write your message to the owner"></textarea>
      <div style="position:absolute;top:18px;right:18px">
        <label class="btn btn-ghost" style="cursor:pointer">Upload
          <input type="file" name="attach" style="display:none">
        </label>
      </div>
      <button class="btn btn-gold" type="submit">Send now</button>
    </form>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
