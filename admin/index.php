<?php
require_once __DIR__ . '/_auth.php';
$items = pto_read_json(CONTENT_FILE);
usort($items, function ($a, $b) {
    return strcmp(isset($b['created']) ? $b['created'] : '', isset($a['created']) ? $a['created'] : '');
});
$visitors = pto_read_json(VISITORS_FILE);
$visitors = array_reverse($visitors);
$msg = isset($_GET['msg']) ? $_GET['msg'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | PROGRESS TECH OFFICIAL</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="bg-video"><video autoplay muted loop playsinline><source src="<?php echo BG_VIDEO; ?>" type="video/mp4"></video></div>
<div class="bg-overlay"></div>
<div class="admin-layout">
  <aside class="side">
    <div class="brand" style="margin-bottom:24px">
      <img src="<?php echo PROFILE_IMAGE; ?>" alt="">
      <span>ADMIN</span>
    </div>
    <a class="active" href="index.php">Dashboard</a>
    <a href="#publish">Publish item</a>
    <a href="#library">Library</a>
    <a href="#visitors">Visitors</a>
    <a href="../explore.php" target="_blank">View explore</a>
    <a href="../index.php">Public site</a>
    <a href="logout.php">Logout</a>
  </aside>
  <main class="admin-main">
    <div class="kicker">PROGRESS TECH OFFICIAL</div>
    <h1>Control room</h1>
    <p class="muted">Upload images, videos, files and links. Everything you add appears live on Explore PROGRESS TECH HOME.</p>
    <?php if ($msg): ?><p class="ok" style="margin-top:10px"><?php echo pto_h($msg); ?></p><?php endif; ?>
    <div class="stats">
      <div class="glass" style="padding:18px"><div class="tiny">Published items</div><h2><?php echo count($items); ?></h2></div>
      <div class="glass" style="padding:18px"><div class="tiny">Visitor events</div><h2><?php echo count($visitors); ?></h2></div>
      <div class="glass" style="padding:18px"><div class="tiny">Operator</div><h2 style="font-size:22px">Progresstech</h2></div>
    </div>

    <section id="publish" class="glass" style="padding:24px;margin-bottom:28px">
      <h3>Add tool / video / file / link</h3>
      <p class="tiny" style="margin:8px 0 16px">Paste a URL, attach a cover image, optional video cover, and a title. Hit Add — it shows on Explore immediately.</p>
      <form class="form wide" action="save.php" method="post" enctype="multipart/form-data">
        <label>Name / title of the tool or file</label>
        <input name="title" required placeholder="Nmap lab notes / TryHackMe path / PDF pack">
        <label>Type</label>
        <select name="type">
          <option value="link">Link</option>
          <option value="tool">Tool</option>
          <option value="video">Video</option>
          <option value="file">File (PDF or other)</option>
          <option value="image">Image</option>
        </select>
        <label>Destination link (optional if uploading a file)</label>
        <input name="url" placeholder="https://example.com">
        <label>Short note</label>
        <input name="note" placeholder="What users should know">
        <div class="file-row">
          <div>
            <label>Cover image for the card</label>
            <input type="file" name="cover" accept="image/*">
          </div>
          <div>
            <label>Or cover image URL</label>
            <input name="cover_url" placeholder="https://...jpg">
          </div>
        </div>
        <div class="file-row">
          <div>
            <label>Upload file (pdf, zip, image...)</label>
            <input type="file" name="asset">
          </div>
          <div>
            <label>Upload video</label>
            <input type="file" name="video" accept="video/*">
          </div>
        </div>
        <label>Or video URL</label>
        <input name="video_url" placeholder="https://...mp4">
        <button class="btn btn-cyan" type="submit">Add</button>
      </form>
    </section>

    <section id="library" style="margin-bottom:28px">
      <h3>Live library</h3>
      <div class="tools" style="margin-top:16px">
        <?php if (!$items): ?>
          <p class="muted">No items yet. Publish the first tool above.</p>
        <?php endif; ?>
        <?php foreach ($items as $it): ?>
          <article class="card glass">
            <img class="tool-cover" src="<?php echo pto_h(!empty($it['cover']) ? $it['cover'] : PROFILE_IMAGE); ?>" alt="">
            <div class="tiny"><?php echo pto_h(strtoupper($it['type'] ?? 'item')); ?> · <?php echo pto_h($it['created'] ?? ''); ?></div>
            <h3><?php echo pto_h($it['title'] ?? ''); ?></h3>
            <p class="tiny"><?php echo pto_h($it['url'] ?? $it['file'] ?? ''); ?></p>
            <form action="delete.php" method="post" style="margin-top:10px">
              <input type="hidden" name="id" value="<?php echo pto_h($it['id']); ?>">
              <button class="btn btn-ghost" type="submit">Delete / remove</button>
            </form>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section id="visitors" class="glass" style="padding:20px;overflow:auto">
      <h3>Users who visited</h3>
      <table class="table">
        <thead><tr><th>Time</th><th>Page</th><th>IP</th><th>Agent</th></tr></thead>
        <tbody>
        <?php foreach (array_slice($visitors, 0, 80) as $v): ?>
          <tr>
            <td><?php echo pto_h($v['time'] ?? ''); ?></td>
            <td><?php echo pto_h($v['page'] ?? ''); ?></td>
            <td><?php echo pto_h($v['ip'] ?? ''); ?></td>
            <td class="tiny"><?php echo pto_h($v['ua'] ?? ''); ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </section>
  </main>
</div>
</body>
</html>
