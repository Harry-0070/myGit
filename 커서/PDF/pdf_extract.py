"""
PDF 파일에서 원하는 범위의 페이지를 추출하여 새 PDF로 저장하는 프로그램
기본 파일: AI 커머스 킥오프.pdf (스크립트와 같은 폴더 또는 현재 폴더)
사용 예: python pdf_extract.py 1-5
       python pdf_extract.py 1,3,5 --output 결과.pdf
"""

import argparse
import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    print("pypdf 라이브러리가 필요합니다. 다음 명령으로 설치하세요: pip install pypdf")
    sys.exit(1)


def parse_page_range(range_str: str, total_pages: int) -> list[int]:
    """
    페이지 범위 문자열을 파싱하여 페이지 번호 리스트 반환.
    지원 형식: "1-5" (1~5페이지), "1,3,5" (특정 페이지만), "1-3,7,9-11" (혼합)
    """
    pages = set()
    parts = range_str.replace(" ", "").split(",")

    for part in parts:
        if "-" in part:
            start, end = part.split("-", 1)
            try:
                start_num = int(start.strip())
                end_num = int(end.strip())
            except ValueError:
                raise ValueError(f"잘못된 범위 형식: {part}")
            if start_num < 1 or end_num > total_pages:
                raise ValueError(f"페이지 번호는 1~{total_pages} 사이여야 합니다.")
            if start_num > end_num:
                start_num, end_num = end_num, start_num
            pages.update(range(start_num, end_num + 1))
        else:
            try:
                num = int(part)
            except ValueError:
                raise ValueError(f"잘못된 페이지 번호: {part}")
            if num < 1 or num > total_pages:
                raise ValueError(f"페이지 번호는 1~{total_pages} 사이여야 합니다.")
            pages.add(num)

    return sorted(pages)


# 기본 사용 PDF 파일명 (해당 파일을 기준으로 실행)
DEFAULT_INPUT_PDF = "AI 커머스 킥오프.pdf"
DEFAULT_OUTPUT_PDF = "AI 커머스 킥오프_추출.pdf"


def find_input_pdf(path: str) -> Path:
    """입력 PDF 경로를 찾는다. 상대 경로면 스크립트 폴더·현재 폴더 순으로 탐색."""
    p = Path(path)
    if p.is_absolute() and p.exists():
        return p
    if p.exists():
        return p.resolve()
    # 스크립트와 같은 폴더에서 찾기
    script_dir = Path(__file__).resolve().parent
    candidate = script_dir / path
    if candidate.exists():
        return candidate
    raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {path} (현재 폴더 또는 {script_dir} 에서 확인해 주세요.)")


def extract_pages(input_path: str, output_path: str, page_range: str) -> None:
    """PDF에서 지정한 페이지 범위를 추출하여 새 파일로 저장"""
    input_file = find_input_pdf(input_path)
    output_file = Path(output_path)

    if not output_file.is_absolute():
        output_file = Path(__file__).resolve().parent / output_path

    reader = PdfReader(str(input_file))
    total_pages = len(reader.pages)

    if total_pages == 0:
        raise ValueError("PDF에 페이지가 없습니다.")

    page_numbers = parse_page_range(page_range, total_pages)
    if not page_numbers:
        raise ValueError("추출할 페이지가 없습니다.")

    writer = PdfWriter()
    for i in page_numbers:
        writer.add_page(reader.pages[i - 1])  # 1-based → 0-based

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "wb") as f:
        writer.write(f)

    print(f"완료: {len(page_numbers)}페이지를 '{output_path}'에 저장했습니다.")
    print(f"  추출된 페이지: {page_numbers}")


def main():
    parser = argparse.ArgumentParser(
        description="PDF에서 원하는 범위의 페이지를 추출하여 새 PDF로 저장합니다. (기본 파일: AI 커머스 킥오프.pdf)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
페이지 범위 예시:
  1-5     1페이지부터 5페이지까지
  1,3,5   1, 3, 5페이지만
  1-3,7   1~3페이지와 7페이지

기본 동작: 원본 = 'AI 커머스 킥오프.pdf', 결과 = 'AI 커머스 킥오프_추출.pdf'
        """,
    )
    parser.add_argument(
        "page_range",
        help="추출할 페이지 범위 (예: 1-5, 1,3,5, 1-3,7)",
    )
    parser.add_argument(
        "-i", "--input",
        default=DEFAULT_INPUT_PDF,
        metavar="PDF",
        help=f"원본 PDF 경로 (기본: {DEFAULT_INPUT_PDF})",
    )
    parser.add_argument(
        "-o", "--output",
        default=DEFAULT_OUTPUT_PDF,
        metavar="PDF",
        help=f"저장할 출력 PDF 경로 (기본: {DEFAULT_OUTPUT_PDF})",
    )
    args = parser.parse_args()

    try:
        extract_pages(args.input, args.output, args.page_range)
    except (FileNotFoundError, ValueError) as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
