#!/usr/bin/env bash
# ABP cheap checks C1 to C3. Run from the repo root. Exit 1 on any hit.
set -u
fail=0
SITE=$(find . -path ./docs -prune -o -path ./.git -prune -o -path ./node_modules -prune -o \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print)
HTML=$(echo "$SITE" | grep '\.html$')
DOCS=$(ls README.md docs/*.md)
hit() { echo "FAIL $1"; echo "$2" | head -20; fail=1; }

# C1: dashes, banned words, NHS-style numbers outside the 999 test range
r=$(grep -n $'—\|–' $SITE $DOCS) && hit "C1 em or en dash" "$r"
r=$(grep -niE "\b(actually|why this matters|how this works|seamless(ly)?|delve|leverage|empower|cutting-edge|game-changer|streamline)\b" $SITE) && hit "C1 banned word" "$r"
r=$(grep -noE "\b[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4}\b" $SITE | grep -vE ":999[ -]?[0-9]{3}[ -]?[0-9]{4}$") && hit "C1 NHS-style number not in 999 range" "$r"

# C2: inert forms, no network calls, no third-party scripts or styles
r=$(grep -nE "<form[^>]*action=|fetch\(|XMLHttpRequest|sendBeacon" $SITE) && hit "C2 data could leave the page" "$r"
r=$(grep -nE "<(script|link)[^>]*(src|href)=\"(https?:)?//" $HTML) && hit "C2 third-party script or style" "$r"

# C3: banner and noindex on every page
for f in $HTML; do
  grep -q "Mock-up. Not real patient data." "$f" || hit "C3 banner missing" "$f"
  grep -q "noindex" "$f" || hit "C3 noindex missing" "$f"
done

[ $fail -eq 0 ] && echo "C1 to C3 passed"
exit $fail
