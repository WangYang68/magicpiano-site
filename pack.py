# -*- coding: utf-8 -*-
"""
把当前目录打包成可直接上传到 Cloudflare Pages 的 zip。

用法（任选其一）：
    python pack.py
    双击 pack.bat

产出：上一级目录下的 site-YYYYMMDD-HHMM.zip
zip 包内根目录直接是 index.html（不会多套一层 html/）。
自动排除：.workbuddy、__pycache__、.git、本脚本自身、已生成的旧 zip。
"""
import os
import sys
import time
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
STAMP = time.strftime('%Y%m%d-%H%M')
OUT = os.path.join(os.path.dirname(HERE), 'site-%s.zip' % STAMP)

# 需要排除的目录 / 文件（按相对路径前缀判断）
EXCLUDE_DIRS = {'.workbuddy', '__pycache__', '.git', '.vscode', 'node_modules'}
EXCLUDE_FILES = {'pack.py', 'pack.bat', '_check.js', 'tools_gen_assets.py'}

files = []
for dirpath, dirnames, filenames in os.walk(HERE):
    rel_dir = os.path.relpath(dirpath, HERE)
    parts = [] if rel_dir == '.' else rel_dir.split(os.sep)
    # 剪掉被排除的分支
    dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDE_DIRS)
    if any(p in EXCLUDE_DIRS for p in parts):
        continue
    for fn in filenames:
        if fn in EXCLUDE_FILES:
            continue
        if fn.startswith('.') or fn.endswith(('.zip', '.pyc', '.tmp', '.bak', '.log')):
            continue
        arc = os.path.join(rel_dir, fn) if rel_dir != '.' else fn
        files.append(arc.replace(os.sep, '/'))

files.sort()

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for rel in files:
        zf.write(os.path.join(HERE, *rel.split('/')), rel)

size_kb = os.path.getsize(OUT) / 1024
print('Done: %s' % OUT)
print('Files: %d   Size: %.1f KB' % (len(files), size_kb))
must = ['index.html', 'assets/css/style.css', 'assets/js/i18n.js', 'assets/js/main.js']
names = set(files)
missing = [m for m in must if m not in names]
if missing:
    print('!! MISSING: %s' % missing)
    sys.exit(1)
print('Structure OK: index.html is at zip root.')

# Windows 下方便查看，停留一下
if os.name == 'nt' and sys.stdin and sys.stdin.isatty():
    try:
        input('Press Enter to exit...')
    except EOFError:
        pass
