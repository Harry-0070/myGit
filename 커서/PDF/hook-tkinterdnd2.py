# PyInstaller hook for tkinterdnd2 (tkdnd binaries 포함)
# 사용: pyinstaller 시 --additional-hooks-dir=.

import os
import platform
from PyInstaller.utils.hooks import collect_data_files, collect_dynamic_libs

system = platform.system()
# 플랫폼별 포함할 폴더·제외할 tcl 파일
platform_config = {
    'Windows': (
        {'win-arm64', 'win-x86', 'win-x64'},
        {'tkdnd_unix.tcl', 'tkdnd_macosx.tcl'}
    ),
    'Linux': (
        {'linux-x64', 'linux-arm64'},
        {'tkdnd_windows.tcl', 'tkdnd_macosx.tcl'}
    ),
    'Darwin': (
        {'osx-x64', 'osx-arm64'},
        {'tkdnd_windows.tcl', 'tkdnd_unix.tcl'}
    ),
}
if system not in platform_config:
    datas = []
    binaries = []
else:
    allowed_dirs, exclude_tcl = platform_config[system]
    datas = []
    binaries = []
    for src, dest in list(collect_data_files('tkinterdnd2')) + list(collect_dynamic_libs('tkinterdnd2')):
        name = os.path.split(src)[1]
        dest_name = os.path.split(dest)[1]
        if dest_name in allowed_dirs or (name not in exclude_tcl and not dest_name.startswith('_')):
            datas.append((src, dest))
