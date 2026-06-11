source "https://rubygems.org"

# GitHub Pages gem bundles a known-good set of Jekyll + plugins that match
# what GitHub's hosted Pages builder uses. Pinning here guarantees the
# local preview matches production.
gem "github-pages", group: :jekyll_plugins

# Plugins we depend on (already transitive via github-pages, listed explicitly
# so Bundler resolves them deterministically for contributors).
group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
end

# Windows + JRuby need bundled timezone data
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Faster file watching on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# HTTP parser pinned for JRuby
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
