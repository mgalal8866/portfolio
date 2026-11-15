<?php
// Served as /sitemap.xml (see .htaccess). Lists both language versions with hreflang links.
require __DIR__ . '/seo.php';

header('Content-Type: application/xml; charset=utf-8');
$lastmod = date('Y-m-d', (int) @filemtime(__DIR__ . '/data/portfolio.json') ?: time());
$alts = '';
foreach (['en', 'ar'] as $l) $alts .= "\n    <xhtml:link rel=\"alternate\" hreflang=\"$l\" href=\"" . h(lang_url($l)) . '"/>';
$alts .= "\n    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"" . h(lang_url('en')) . '"/>';

echo '<?xml version="1.0" encoding="UTF-8"?>', "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<?php foreach (['en', 'ar'] as $l): ?>
  <url>
    <loc><?= h(lang_url($l)) ?></loc>
    <lastmod><?= $lastmod ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority><?= $l === 'en' ? '1.0' : '0.9' ?></priority><?= $alts ?>

  </url>
<?php endforeach; ?>
</urlset>
