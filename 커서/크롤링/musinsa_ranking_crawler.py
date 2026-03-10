"""
무신사 랭킹 크롤러
- requests 우선 시도 → 실패 시 Selenium으로 동적 페이지 대응
- 최대 100건 수집
"""

import re
import time
from typing import Optional

MAX_ITEMS = 100

# 무신사 랭킹 URL (sectionId=200)
DEFAULT_URL = (
    "https://www.musinsa.com/main/musinsa/ranking"
    "?gf=A&storeCode=musinsa&sectionId=200&contentsId=&categoryCode=000"
    "&ageBand=AGE_BAND_ALL&subPan=product"
)

# 백업 URL (랭킹 페이지 변동 시 대비)
BACKUP_URLS = [
    "https://www.musinsa.com/main/musinsa/ranking?gf=A&storeCode=musinsa&sectionId=201&categoryCode=000&ageBand=AGE_BAND_ALL&subPan=product",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Referer": "https://www.musinsa.com/",
}


def _clean_price(text: str) -> str:
    if not text:
        return ""
    numbers = re.findall(r"[\d,]+", text)
    return numbers[-1] if numbers else text.strip()


def _parse_from_soup(soup, max_items: int) -> list[dict]:
    """BeautifulSoup 결과에서 상품 목록 추출"""
    items = []
    rank = 0

    def add_item(brand: str, product: str, price: str, link: str):
        nonlocal rank
        if not (brand or product):
            return
        rank += 1
        items.append({
            "rank": rank,
            "brand": brand.strip(),
            "product": product.strip(),
            "price": _clean_price(price),
            "link": link or "",
        })

    # 셀렉터 후보들 (무신사 페이지 구조 변동 대비)
    selectors = [
        ("div.article_info", "p.item_title a", "p.list_info a", "p.price"),
        ("div.list-box div.article_info", "p.item_title a", "p.list_info a", "p.price"),
        ("li.li_box", ".item_title a", ".list_info a", ".price"),
        ("li.li_box", ".item_title", ".list_info a", ".price"),
        ("div.article_info", ".item_title", ".list_info a", ".price"),
        ("[class*='goods']", "[class*='brand']", "a[href*='goods']", "[class*='price']"),
    ]

    for container_sel, brand_sel, prod_sel, price_sel in selectors:
        if len(items) >= max_items:
            break
        items = []
        rank = 0

        containers = soup.select(container_sel)[:max_items * 2]
        for info in containers:
            if len(items) >= max_items:
                break
            try:
                brand_el = info.select_one(brand_sel)
                product_el = info.select_one(prod_sel)
                price_el = info.select_one(price_sel)

                brand = (brand_el.get_text(strip=True) if brand_el else "").strip()
                product = ""
                if product_el:
                    product = product_el.get("title") or product_el.get_text(strip=True)
                product = product.strip() if product else ""
                price_raw = (price_el.get_text(strip=True) if price_el else "").strip()
                link = ""
                if product_el and product_el.get("href"):
                    href = product_el["href"]
                    link = href if href.startswith("http") else f"https://www.musinsa.com{href}"

                add_item(brand, product, price_raw, link)
            except Exception:
                continue

        if items:
            break

    return items[:max_items]


def _crawl_with_requests(url: str, max_items: int) -> list[dict]:
    """requests로 크롤링"""
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError as e:
        raise RuntimeError(f"필요한 패키지가 없습니다: {e}") from e

    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    resp.encoding = "utf-8"

    try:
        soup = BeautifulSoup(resp.text, "lxml")
    except Exception:
        soup = BeautifulSoup(resp.text, "html.parser")

    items = _parse_from_soup(soup, max_items)
    return items


def _crawl_with_selenium(url: str, max_items: int) -> list[dict]:
    """Selenium으로 동적 페이지 크롤링"""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from webdriver_manager.chrome import ChromeDriverManager
        from bs4 import BeautifulSoup
    except ImportError as e:
        raise RuntimeError(
            "Selenium 실행을 위해 다음을 설치해 주세요:\n"
            "  pip install selenium webdriver-manager"
        ) from e

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(f"user-agent={HEADERS['User-Agent']}")

    driver = None
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.get(url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(2)
        html = driver.page_source
    finally:
        if driver:
            driver.quit()

    soup = BeautifulSoup(html, "html.parser")
    return _parse_from_soup(soup, max_items)


def crawl_musinsa_ranking(
    url: Optional[str] = None,
    use_backup: bool = False,
    max_items: int = MAX_ITEMS,
) -> list[dict]:
    """
    무신사 랭킹 크롤링.
    1) requests 시도 → 2) 실패/빈 결과 시 Selenium 시도 → 3) 백업 URL 시도
    """
    base = url or DEFAULT_URL
    urls_to_try = [base] + (BACKUP_URLS if use_backup else [])

    last_error = None

    # 1) requests 시도
    for target_url in urls_to_try:
        try:
            items = _crawl_with_requests(target_url, max_items)
            if items:
                return items[:max_items]
        except Exception as e:
            last_error = e
            continue

    # 2) Selenium 시도 (동적 페이지)
    for target_url in urls_to_try:
        try:
            items = _crawl_with_selenium(target_url, max_items)
            if items:
                return items[:max_items]
        except Exception as e:
            last_error = e
            continue

    if last_error:
        err_msg = str(last_error)
        if "404" in err_msg or "Not Found" in err_msg:
            raise RuntimeError(
                "페이지를 찾을 수 없습니다 (404).\n"
                "무신사 사이트 구조가 변경되었을 수 있습니다.\n"
                "인터넷 연결과 URL을 확인해 주세요."
            )
        if "timeout" in err_msg.lower() or "Timeout" in err_msg:
            raise RuntimeError("요청 시간이 초과되었습니다. 네트워크를 확인해 주세요.")
        raise RuntimeError(f"크롤링 실패: {last_error}")

    raise RuntimeError("수집된 데이터가 없습니다. 페이지 구조가 변경되었을 수 있습니다.")
