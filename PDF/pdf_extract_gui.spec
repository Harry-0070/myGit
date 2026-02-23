# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec: PDF 텍스트 추출 GUI → 단일 exe

import sys
from PyInstaller.utils.hooks import collect_all

block_cipher = None

# tkinterdnd2 (드래그앤드롭) 전체 포함
tmp = collect_all('tkinterdnd2')
tkdnd_datas = tmp[0]
tkdnd_binaries = tmp[1]
tkdnd_hiddenimports = tmp[2]

a = Analysis(
    ['pdf_extract_gui.py'],
    pathex=[],
    binaries=tkdnd_binaries,
    datas=tkdnd_datas,
    hiddenimports=[
        'pypdf',
        'pdf_extract',
        'tkinter',
    ] + tkdnd_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='PDF텍스트추출',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
