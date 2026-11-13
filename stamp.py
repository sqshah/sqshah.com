#!/usr/bin/env python3
"""Stamp every local asset reference with a hash of the file's contents.

_headers tells the edge to cache .js and /assets/* as immutable for a year,
which is right — but only if the URL changes when the file does. A reference
written by hand as src="room.js" can never change, so a visitor who loaded the
page once is served that first copy forever. This ran by hand until it didn't,
so now it runs on every commit (see .git/hooks/pre-commit).

Rewrites src/href="path" and src/href="path?v=old" to path?v=<hash>.
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
REF = re.compile(r'((?:src|href)=")([^"#?:]+\.(?:js|css|json|png|jpg|svg|webp))(?:\?v=[0-9a-f]+)?(")')


def digest(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()[:8]


def main() -> int:
    changed = []
    for html in sorted(ROOT.glob('*.html')):
        src = html.read_text(encoding='utf-8')

        def sub(m):
            path = (ROOT / m.group(2)).resolve()
            if not path.is_file() or ROOT not in path.parents and path.parent != ROOT:
                return m.group(0)          # external or missing: leave it alone
            return f'{m.group(1)}{m.group(2)}?v={digest(path)}{m.group(3)}'

        out = REF.sub(sub, src)
        if out != src:
            html.write_text(out, encoding='utf-8')
            changed.append(html.name)
    print('stamped:', ', '.join(changed) if changed else 'nothing to do')
    return 0


if __name__ == '__main__':
    sys.exit(main())
