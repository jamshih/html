#!/usr/bin/env python3
"""Python 3.11-safe bootstrap for the Milestone 2 builder.

The first M2 builder commit is intentionally frozen as the core implementation so
failures remain reproducible. This bootstrap fetches that exact core, applies the
single Python-3.11 ASS-path syntax repair in memory, compiles it, then executes it
with this file's repository-relative context. Spoken-media selection/render logic
is unchanged by this bootstrap.
"""
from __future__ import annotations

import urllib.request

CORE_COMMIT = "f010624602d72f267ee3c6ba5086080d5cd7e0e4"
CORE_URL = (
    "https://raw.githubusercontent.com/jamshih/html/"
    + CORE_COMMIT
    + "/.github/scripts/hearframe-m2-build.py"
)

with urllib.request.urlopen(CORE_URL, timeout=30) as response:
    source = response.read().decode("utf-8")

lines = source.splitlines()
patched = []
fix_count = 0
for line in lines:
    if line.strip().startswith('vf=f"ass={str(ass).replace'):
        indent = line[: len(line) - len(line.lstrip())]
        patched.append(indent + 'escaped_ass = str(ass).replace(":", r"\\:")')
        patched.append(indent + 'vf=f"ass={escaped_ass},tpad=stop_mode=clone:stop_duration=2.4"')
        fix_count += 1
    else:
        patched.append(line)

if fix_count != 1:
    raise RuntimeError(f"m2_bootstrap_expected_one_ass_fix_got_{fix_count}")

code = "\n".join(patched) + "\n"
compile(code, __file__, "exec")
print(f"Hearframe M2 core {CORE_COMMIT} loaded; Python 3.11 ASS syntax fix applied.", flush=True)
exec(compile(code, __file__, "exec"), globals(), globals())
