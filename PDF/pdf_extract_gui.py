"""
PDF 텍스트 추출 GUI
- PDF 파일을 드래그 앤 드롭 또는 버튼으로 선택
- 페이지 범위 입력 후 해당 페이지의 텍스트를 TXT 파일로 저장
"""

import sys
from pathlib import Path
from typing import Optional

# 드래그앤드롭 지원 시도 (실패하면 클릭으로만 파일 선택)
try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    HAS_DND = True
except Exception:
    DND_FILES = None
    TkinterDnD = None
    HAS_DND = False

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

# 페이지 범위 파싱 (pdf_extract와 동일 로직)
try:
    from pdf_extract import parse_page_range
except ImportError:

    def parse_page_range(range_str: str, total_pages: int) -> list:
        pages = set()
        parts = range_str.replace(" ", "").split(",")
        for part in parts:
            if "-" in part:
                start, end = part.split("-", 1)
                start_num, end_num = int(start.strip()), int(end.strip())
                if start_num > end_num:
                    start_num, end_num = end_num, start_num
                if start_num < 1 or end_num > total_pages:
                    raise ValueError(f"페이지는 1~{total_pages} 사이여야 합니다.")
                pages.update(range(start_num, end_num + 1))
            else:
                num = int(part)
                if num < 1 or num > total_pages:
                    raise ValueError(f"페이지는 1~{total_pages} 사이여야 합니다.")
                pages.add(num)
        return sorted(pages)


def extract_pages_to_txt(input_path: str, output_path: str, page_range: str) -> None:
    """PDF에서 지정한 페이지의 텍스트를 추출하여 TXT 파일로 저장"""
    if PdfReader is None:
        raise ImportError("pypdf가 설치되지 않았습니다. 명령 프롬프트에서 실행: pip install pypdf")
    input_file = Path(input_path)
    if not input_file.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {input_path}")
    reader = PdfReader(str(input_file))
    total_pages = len(reader.pages)
    if total_pages == 0:
        raise ValueError("PDF에 페이지가 없습니다.")
    page_numbers = parse_page_range(page_range, total_pages)
    parts = []
    for i in page_numbers:
        text = reader.pages[i - 1].extract_text() or ""
        parts.append(f"---------- 페이지 {i} ----------\n{text}")
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n\n".join(parts), encoding="utf-8")


def get_dropped_files(root, event_data):
    """tkinterdnd2 event.data에서 파일 경로 리스트 추출 (tk.splitlist 사용, 공백 경로 지원)"""
    if not event_data:
        return []
    try:
        return list(root.tk.splitlist(event_data))
    except Exception:
        pass
    s = str(event_data).strip()
    if s.startswith("{") and s.endswith("}"):
        s = s[1:-1]
    try:
        return list(root.tk.splitlist(s))
    except Exception:
        return [s.strip().strip("{}")] if s else []


class PdfExtractApp:
    def __init__(self):
        if PdfReader is None:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror(
                "패키지 필요",
                "pypdf가 설치되지 않았습니다.\n\n"
                "명령 프롬프트(또는 터미널)에서 아래를 실행한 뒤 다시 실행하세요:\n\n"
                "  pip install pypdf\n\n"
                "또는: pip install -r requirements.txt"
            )
            sys.exit(1)
        try:
            self.root = TkinterDnD.Tk() if HAS_DND and TkinterDnD else tk.Tk()
        except Exception:
            self.root = tk.Tk()
        self.root.title("PDF 텍스트 추출 → TXT")
        self.root.geometry("480x380")
        self.root.minsize(420, 320)

        self.input_path: str = ""
        self.save_dir: Optional[str] = None  # 저장 기본 폴더 (None이면 PDF와 같은 폴더)
        self._build_menu()
        self._build_ui()

    def _build_menu(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        menu_set = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="설정", menu=menu_set)
        menu_set.add_command(label="저장 폴더 선택...", command=self._on_choose_save_dir)
        menu_set.add_command(label="저장 위치 초기화 (PDF와 같은 폴더)", command=self._on_reset_save_dir)
        menu_set.add_separator()
        menu_set.add_command(label="종료", command=self.root.quit)

    def _on_choose_save_dir(self):
        folder = filedialog.askdirectory(title="저장할 기본 폴더 선택")
        if folder:
            self.save_dir = folder
            self.status_var.set(f"저장 위치: {folder}")
            messagebox.showinfo("저장 위치", f"기본 저장 폴더가 설정되었습니다.\n{folder}")

    def _on_reset_save_dir(self):
        self.save_dir = None
        self.status_var.set("저장 위치: PDF 파일과 같은 폴더")

    def _build_ui(self):
        pad = {"padx": 12, "pady": 6}

        # 1) 파일 영역 — Listbox가 드래그앤드롭을 지원함 (tkinterdnd2)
        file_frame = ttk.LabelFrame(self.root, text="PDF 파일", padding=8)
        file_frame.pack(fill=tk.BOTH, expand=True, **pad)

        self.drop_zone = tk.Frame(file_frame, relief=tk.GROOVE, borderwidth=2, bg="#f0f4f8")
        self.drop_zone.pack(fill=tk.BOTH, expand=True, pady=(0, 4))

        self.drop_listbox = tk.Listbox(
            self.drop_zone,
            height=4,
            font=("", 11),
            bg="#f0f4f8",
            fg="#666",
            selectbackground="#d8e4f0",
            selectforeground="#1a5fb4",
            relief=tk.FLAT,
            highlightthickness=0,
            activestyle="none",
            cursor="hand2",
        )
        self.drop_listbox.pack(fill=tk.BOTH, expand=True, padx=8, pady=12)
        self._drop_placeholder = "PDF 파일을 여기에 드래그 앤 드롭하세요 (클릭하면 파일 선택)"
        self.drop_listbox.insert(tk.END, self._drop_placeholder)
        self.drop_listbox.bind("<Button-1>", self._on_drop_zone_click)

        if HAS_DND and DND_FILES is not None:
            try:
                self.drop_listbox.drop_target_register(DND_FILES)
                self.drop_listbox.dnd_bind("<<Drop>>", self._on_drop)
                self.drop_listbox.dnd_bind("<<DropEnter>>", self._on_drop_enter)
                self.drop_listbox.dnd_bind("<<DropLeave>>", self._on_drop_leave)
            except (AttributeError, TypeError, Exception):
                pass

        # 2) 페이지 범위
        range_frame = ttk.LabelFrame(self.root, text="추출할 페이지", padding=8)
        range_frame.pack(fill=tk.X, **pad)

        self.range_var = tk.StringVar()
        self.range_var.set("1-5")
        range_entry = ttk.Entry(
            range_frame,
            textvariable=self.range_var,
            width=30,
        )
        range_entry.pack(anchor=tk.W)
        ttk.Label(
            range_frame,
            text="예: 1-5 (연속), 1,3,5 (개별), 1-3,7 (혼합)",
            foreground="gray",
            font=("", 8),
        ).pack(anchor=tk.W)

        # 3) 추출 버튼
        self.btn_extract = ttk.Button(
            self.root,
            text="추출하기",
            command=self._on_extract,
        )
        self.btn_extract.pack(pady=10)

        # 4) 상태
        self.status_var = tk.StringVar()
        self.status_var.set("")
        status_label = ttk.Label(
            self.root,
            textvariable=self.status_var,
            foreground="gray",
            wraplength=420,
        )
        status_label.pack(fill=tk.X, **pad)

    def _on_drop_zone_click(self, event):
        self._on_browse()

    def _set_file_display(self, path_str: str):
        """선택된 파일 경로를 드롭 존에 표시"""
        self.drop_listbox.delete(0, tk.END)
        name = Path(path_str).name if path_str else self._drop_placeholder
        self.drop_listbox.insert(tk.END, name)
        if path_str:
            self.drop_zone.configure(bg="#e6f4e6")
            self.drop_listbox.configure(bg="#e6f4e6", fg="#1a7f37")
        else:
            self.drop_zone.configure(bg="#f0f4f8")
            self.drop_listbox.configure(bg="#f0f4f8", fg="#666")

    def _on_drop_enter(self, event):
        try:
            self.drop_zone.configure(bg="#d8e4f0")
            self.drop_listbox.configure(bg="#d8e4f0", fg="#1a5fb4")
        except Exception:
            pass

    def _on_drop_leave(self, event):
        try:
            if not self.input_path:
                self.drop_zone.configure(bg="#f0f4f8")
                self.drop_listbox.configure(bg="#f0f4f8", fg="#666")
            else:
                self.drop_zone.configure(bg="#e6f4e6")
                self.drop_listbox.configure(bg="#e6f4e6", fg="#1a7f37")
        except Exception:
            pass

    def _on_drop(self, event):
        try:
            data = getattr(event, "data", None)
        except Exception:
            data = None
        files = get_dropped_files(self.root, data)
        if not files:
            return
        path = files[0]
        p = Path(path)
        if p.suffix.lower() != ".pdf":
            self.status_var.set("PDF 파일만 넣어 주세요.")
            return
        if not p.exists():
            self.status_var.set(f"파일을 찾을 수 없습니다: {path}")
            return
        self.input_path = str(p.resolve())
        self._set_file_display(self.input_path)
        self.status_var.set("")

    def _on_browse(self):
        path = filedialog.askopenfilename(
            title="PDF 파일 선택",
            filetypes=[("PDF 파일", "*.pdf"), ("모든 파일", "*.*")],
        )
        if path:
            self.input_path = path
            self._set_file_display(path)
            self.status_var.set("")

    def _on_extract(self):
        if not self.input_path:
            self.status_var.set("먼저 PDF 파일을 선택하세요.")
            messagebox.showwarning("알림", "PDF 파일을 드래그 앤 드롭하거나 [파일 선택]으로 골라 주세요.")
            return

        range_str = (self.range_var.get() or "").strip()
        if not range_str:
            self.status_var.set("추출할 페이지 범위를 입력하세요 (예: 1-5).")
            messagebox.showwarning("알림", "페이지 범위를 입력하세요. (예: 1-5, 1,3,5)")
            return

        inp = Path(self.input_path)
        initial_dir = self.save_dir if self.save_dir else str(inp.parent)
        out_path = Path(initial_dir) / f"{inp.stem}_추출.txt"

        save_path = filedialog.asksaveasfilename(
            title="저장할 TXT 파일 경로",
            initialfile=out_path.name,
            initialdir=initial_dir,
            defaultextension=".txt",
            filetypes=[("텍스트 파일", "*.txt"), ("모든 파일", "*.*")],
        )
        if not save_path:
            return

        self.status_var.set("텍스트 추출 중...")
        self.btn_extract.configure(state=tk.DISABLED)
        self.root.update()

        try:
            extract_pages_to_txt(self.input_path, save_path, range_str)
            self.status_var.set(f"완료: {save_path}")
            messagebox.showinfo("완료", f"TXT 파일로 저장했습니다.\n{save_path}")
        except FileNotFoundError as e:
            self.status_var.set(str(e))
            messagebox.showerror("오류", str(e))
        except ValueError as e:
            self.status_var.set(str(e))
            messagebox.showerror("오류", str(e))
        except Exception as e:
            self.status_var.set(str(e))
            messagebox.showerror("오류", str(e))
        finally:
            self.btn_extract.configure(state=tk.NORMAL)

    def run(self):
        self.root.mainloop()


def main():
    app = PdfExtractApp()
    app.run()


if __name__ == "__main__":
    main()
