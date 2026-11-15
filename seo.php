<?php
/**
 * Shared SEO helpers for index.php, sitemap.php and robots.php.
 * Everything is derived from data/portfolio.json, so the dashboard stays the single source of truth.
 */
declare(strict_types=1);

function seo_data(): array {
    static $d;
    if ($d === null) {
        $json = @file_get_contents(__DIR__ . '/data/portfolio.json');
        $d = $json ? (json_decode($json, true) ?: []) : [];
        $d += ['profile' => [], 'stats' => [], 'skills' => [], 'experience' => [], 'projects' => []];
    }
    return $d;
}

/** Arabic value from "<key>_ar" when filled in (and lang is ar), English otherwise — mirrors tr() in main.js */
function tr(array $o, string $k, string $lang) {
    $v = $lang === 'ar' ? ($o[$k . '_ar'] ?? null) : null;
    return ($v !== null && $v !== '' && $v !== []) ? $v : ($o[$k] ?? '');
}

function h($s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

/** Public base URL ending in "/": profile.siteUrl from the dashboard, or auto-detected from the request */
function base_url(): string {
    $site = trim((string) (seo_data()['profile']['siteUrl'] ?? ''));
    if ($site !== '') return rtrim($site, '/') . '/';
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $dir . '/';
}

function lang_url(string $lang): string { return base_url() . ($lang === 'ar' ? '?lang=ar' : ''); }

function abs_url(string $path): string { return preg_match('~^https?://~', $path) ? $path : base_url() . ltrim($path, '/'); }

function first_sentence(string $s, int $max = 160): string {
    $s = trim(preg_split('/(?<=[.!?؟])\s/u', $s)[0] ?? $s);
    return mb_strlen($s) > $max ? rtrim(mb_substr($s, 0, $max - 1)) . '…' : $s;
}
