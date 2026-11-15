<?php
// Served as /robots.txt (see .htaccess) so the Sitemap line always carries the real domain.
require __DIR__ . '/seo.php';

header('Content-Type: text/plain; charset=utf-8');
echo "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/backups/\n\nSitemap: " . base_url() . "sitemap.xml\n";
