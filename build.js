#!/usr/bin/env node
/* Green Man's — static site builder: stitches shell.html + pages/*.html into dist/ */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const shell = fs.readFileSync(path.join(SRC, 'shell.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'site.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'site.js'), 'utf8');

const PAGES = [
  {
    file: 'index.html',
    nav: 'home',
    title: "Green Man's Contracting & Landscaping LLC | Greater Hartford, CT",
    desc: "Landscaping, contracting and snow removal for Greater Hartford, Connecticut. Rated 4.9 stars \u2014 open 24 hours. Call (860) 768-2193 for a free estimate."
  },
  {
    file: 'services.html',
    nav: 'services',
    title: "Services | Green Man's Contracting & Landscaping LLC",
    desc: "Landscaping & grounds care, contracting & handyman work, snow & ice removal, and seasonal cleanups \u2014 one crew, year-round."
  },
  {
    file: 'work.html',
    nav: 'work',
    title: "Our Work | Green Man's Contracting & Landscaping LLC",
    desc: "A look at recent landscaping, contracting and snow removal jobs completed across Greater Hartford, Connecticut."
  },
  {
    file: 'about.html',
    nav: 'about',
    title: "About | Green Man's Contracting & Landscaping LLC",
    desc: "Meet the crew behind Green Man's Contracting & Landscaping \u2014 4.9 stars from 11 Google reviews, serving Greater Hartford."
  },
  {
    file: 'contact.html',
    nav: 'contact',
    title: "Contact | Green Man's Contracting & Landscaping LLC",
    desc: "Call (860) 768-2193 or request a free estimate online. Green Man's Contracting & Landscaping is open 24 hours."
  }
];

fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets', 'site.css'), css);
fs.writeFileSync(path.join(DIST, 'assets', 'site.js'), js);

let built = 0;
for (const p of PAGES) {
  const contentPath = path.join(SRC, 'pages', p.file);
  const content = fs.readFileSync(contentPath, 'utf8');

  let html = shell
    .replace(/\{\{TITLE\}\}/g, p.title)
    .replace(/\{\{DESC\}\}/g, p.desc)
    .replace(/\{\{PAGE\}\}/g, p.nav)
    .replace(/\{\{H\}\}/g, '')
    .replace('{{HEAD}}', '<link rel="stylesheet" href="assets/site.css">')
    .replace('{{CONTENT}}', content)
    .replace('{{SCRIPT}}', '<script src="assets/site.js" defer></script>');

  // mark current nav item
  html = html.replace(
    new RegExp('(data-nav="' + p.nav + '")', 'g'),
    '$1 aria-current="page"'
  );

  fs.writeFileSync(path.join(DIST, p.file), html);
  built++;
  console.log('built:', p.file);
}
console.log('Done \u2014 ' + built + ' pages written to dist/');
