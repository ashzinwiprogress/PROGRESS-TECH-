<?php
$pageTitle = 'Explore PROGRESS TECH HOME';
$pageId = 'explore';
include __DIR__ . '/includes/header.php';
$items = pto_read_json(CONTENT_FILE);
usort($items, function ($a, $b) {
    return strcmp(isset($b['created']) ? $b['created'] : '', isset($a['created']) ? $a['created'] : '');
});
$q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
if ($q !== '') {
    $items = array_values(array_filter($items, function ($it) use ($q) {
        $blob = strtolower(($it['title'] ?? '') . ' ' . ($it['type'] ?? '') . ' ' . ($it['url'] ?? ''));
        return strpos($blob, $q) !== false;
    }));
}
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Live arsenal</div>
    <h1>Explore PROGRESS TECH HOME</h1>
    <p class="muted">Tools, videos, files and links published from the admin dashboard appear here in real time.</p>
    <form class="searchbar" method="get">
      <input name="q" value="<?php echo pto_h($q); ?>" placeholder="Search tools, videos, files...">
      <button class="btn btn-cyan" type="submit">Search</button>
    </form>
    <?php if (!$items): ?>
      <div class="glass" style="padding:28px">
        <h3>Nothing published yet</h3>
        <p class="muted">When the admin adds a tool, video, PDF or link with a cover, it will show here instantly.</p>
      </div>
    <?php else: ?>
      <div class="tools">
        <?php foreach ($items as $it): ?>
          <article class="card glass">
            <?php if (!empty($it['cover'])): ?>
              <img class="tool-cover" src="<?php echo pto_h($it['cover']); ?>" alt="">
            <?php else: ?>
              <img class="tool-cover" src="<?php echo PROFILE_IMAGE; ?>" alt="">
            <?php endif; ?>
            <div class="tiny"><?php echo pto_h(strtoupper(isset($it['type']) ? $it['type'] : 'item')); ?></div>
            <h3><?php echo pto_h(isset($it['title']) ? $it['title'] : 'Untitled'); ?></h3>
            <?php if (!empty($it['note'])): ?><p><?php echo pto_h($it['note']); ?></p><?php endif; ?>
            <?php
              $href = '';
              if (!empty($it['url'])) $href = $it['url'];
              elseif (!empty($it['file'])) $href = $it['file'];
            ?>
            <?php if ($href): ?>
              <a class="btn btn-cyan" style="margin-top:12px" href="<?php echo pto_h($href); ?>" target="_blank" rel="noopener">Try right now</a>
            <?php endif; ?>
            <?php if (!empty($it['video'])): ?>
              <video style="width:100%;margin-top:12px;border-radius:12px" controls src="<?php echo pto_h($it['video']); ?>"></video>
            <?php endif; ?>
          </article>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
