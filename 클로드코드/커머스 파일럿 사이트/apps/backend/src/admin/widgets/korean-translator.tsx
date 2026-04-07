import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

// =============================================
// 한글 번역 사전
// =============================================
const TRANSLATIONS: Record<string, string> = {
  // 사이드바 메인 메뉴
  "Orders": "주문",
  "Draft Orders": "임시 주문",
  "Draft Order": "임시 주문",
  "Products": "상품",
  "Collections": "컬렉션",
  "Categories": "카테고리",
  "Inventory": "재고",
  "Reservations": "예약 재고",
  "Customers": "고객",
  "Customer Groups": "고객 그룹",
  "Promotions": "프로모션",
  "Pricing": "가격 설정",
  "Price Lists": "가격 목록",
  "Sales Channels": "판매 채널",
  "Settings": "설정",

  // 설정 서브메뉴
  "Store": "스토어",
  "Users": "사용자",
  "Regions": "지역",
  "Tax Regions": "세금 지역",
  "Return Reasons": "반품 사유",
  "Shipping Profiles": "배송 프로필",
  "Locations & Shipping": "배송지 & 배송",
  "Locations": "배송지",
  "Payment Providers": "결제 수단",
  "API Keys": "API 키",
  "Publishable API Keys": "공개 API 키",
  "Secret API Keys": "비공개 API 키",
  "Workflows": "워크플로우",
  "Taxes": "세금",

  // 공통 버튼/액션
  "Create": "생성",
  "Edit": "수정",
  "Delete": "삭제",
  "Save": "저장",
  "Save and close": "저장 후 닫기",
  "Cancel": "취소",
  "Confirm": "확인",
  "Add": "추가",
  "Remove": "제거",
  "Back": "뒤로",
  "Next": "다음",
  "Previous": "이전",
  "Close": "닫기",
  "Search": "검색",
  "Filter": "필터",
  "Export": "내보내기",
  "Import": "가져오기",
  "Continue": "계속",
  "Submit": "제출",
  "Apply": "적용",
  "Reset": "초기화",
  "View": "보기",
  "View details": "상세 보기",
  "View all": "전체 보기",
  "Actions": "액션",
  "More actions": "더보기",
  "Copy": "복사",
  "Duplicate": "복제",
  "Publish": "게시",
  "Unpublish": "게시 취소",
  "Archive": "보관",
  "Unarchive": "보관 취소",

  // 상태
  "Status": "상태",
  "Active": "활성",
  "Inactive": "비활성",
  "Pending": "대기중",
  "Completed": "완료",
  "Cancelled": "취소됨",
  "Refunded": "환불됨",
  "Partially refunded": "부분 환불됨",
  "Requires action": "처리 필요",
  "Failed": "실패",
  "Draft": "임시저장",
  "Proposed": "제안됨",
  "Rejected": "거부됨",
  "Requested": "요청됨",
  "Received": "수령됨",
  "Not fulfilled": "미처리",
  "Partially fulfilled": "부분 처리",
  "Fulfilled": "처리완료",
  "Partially shipped": "부분 배송",
  "Shipped": "배송됨",
  "Partially delivered": "부분 배달",
  "Delivered": "배달완료",
  "Awaiting": "대기중",

  // 상품 관련
  "Title": "상품명",
  "Description": "설명",
  "Type": "유형",
  "Tags": "태그",
  "Variants": "옵션/변형",
  "Images": "이미지",
  "Options": "옵션",
  "Thumbnail": "썸네일",
  "Media": "미디어",
  "Attributes": "속성",
  "Organization": "분류",
  "Availability": "판매 채널",
  "Discountable": "할인 가능",
  "General information": "기본 정보",
  "Dimensions": "크기/무게",
  "Stock & Inventory": "재고 관리",
  "Shipping": "배송",
  "SKU": "SKU",
  "Barcode": "바코드",
  "EAN": "EAN",
  "UPC": "UPC",
  "Height": "높이",
  "Width": "너비",
  "Length": "길이",
  "Weight": "무게",
  "Manage inventory": "재고 관리",
  "Allow backorder": "재고 부족시 주문 허용",
  "Quantity": "수량",
  "In stock": "재고 있음",
  "Out of stock": "품절",

  // 주문 관련
  "Order": "주문",
  "Order details": "주문 상세",
  "Order summary": "주문 요약",
  "Line items": "주문 상품",
  "Fulfillments": "처리 현황",
  "Returns": "반품",
  "Exchanges": "교환",
  "Payment": "결제",
  "Timeline": "타임라인",
  "Customer": "고객",
  "Shipping address": "배송지",
  "Billing address": "청구지",
  "Subtotal": "소계",
  "Discount": "할인",
  "Shipping total": "배송비",
  "Tax total": "세금",
  "Total": "합계",
  "Amount": "금액",
  "Refund": "환불",
  "Capture": "결제 승인",
  "Mark as paid": "결제 완료 처리",
  "Mark as delivered": "배달 완료 처리",
  "Create fulfillment": "처리 생성",
  "Create return": "반품 생성",
  "Create exchange": "교환 생성",

  // 고객 관련
  "First name": "이름",
  "Last name": "성",
  "Email": "이메일",
  "Phone": "전화번호",
  "Address": "주소",
  "Company": "회사",
  "Country": "국가",
  "City": "도시",
  "Province": "주/도",
  "Postal code": "우편번호",
  "Birthday": "생년월일",

  // 프로모션/할인
  "Promotion": "프로모션",
  "Discount code": "할인 코드",
  "Percentage": "퍼센트",
  "Fixed amount": "고정 금액",
  "Free shipping": "무료 배송",
  "Expires at": "만료일",
  "Usage limit": "사용 횟수 제한",
  "Minimum amount": "최소 주문 금액",
  "Maximum discount": "최대 할인액",

  // 페이지 공통
  "Overview": "개요",
  "Details": "상세",
  "Summary": "요약",
  "Loading...": "로딩 중...",
  "No results": "결과 없음",
  "No orders found": "주문이 없습니다",
  "No products found": "상품이 없습니다",
  "No customers found": "고객이 없습니다",
  "items": "개",
  "item": "개",
  "of": "중",
  "results": "건",
  "Select": "선택",
  "Selected": "선택됨",
  "Clear": "초기화",
  "Clear all": "전체 초기화",
  "Updated": "수정됨",
  "Created": "생성됨",
  "Created at": "생성일",
  "Updated at": "수정일",
  "Name": "이름",
  "Code": "코드",
  "Value": "값",
  "Note": "메모",
  "Notes": "메모",
  "Add note": "메모 추가",
  "Metadata": "메타데이터",
  "Key": "키",
  "No data": "데이터 없음",
  "Error": "오류",
  "Success": "성공",
  "Warning": "경고",
  "Information": "정보",
  "Required": "필수",
  "Optional": "선택",
  "Enabled": "활성화",
  "Disabled": "비활성화",
  "Yes": "예",
  "No": "아니오",
  "Not set": "미설정",
  "Add new": "새로 추가",
  "Go back": "돌아가기",
  "Expand": "펼치기",
  "Collapse": "접기",
  "Show": "표시",
  "Hide": "숨기기",
  "Sort": "정렬",
  "Ascending": "오름차순",
  "Descending": "내림차순",

  // 한글 대시보드 메뉴명 (이미 커스텀 추가한 것)
  "한국어 대시보드": "한국어 대시보드",
}

// =============================================
// 번역 엔진
// =============================================
function translateTextNode(node: Text): void {
  const original = node.textContent?.trim() ?? ""
  if (!original || original.length > 60) return
  const translated = TRANSLATIONS[original]
  if (translated && node.textContent !== translated) {
    node.textContent = node.textContent!.replace(original, translated)
  }
}

function walkAndTranslate(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName
      // 입력 필드, 스크립트, 스타일은 번역 제외
      if (["INPUT", "TEXTAREA", "SCRIPT", "STYLE", "CODE", "PRE"].includes(tag))
        return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const nodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as Text)
  nodes.forEach(translateTextNode)
}

// =============================================
// 위젯 컴포넌트 (실제 렌더링 없음, 번역만 실행)
// =============================================
const KoreanTranslatorWidget = () => {
  useEffect(() => {
    // 중복 실행 방지
    const win = window as typeof window & { __fabricI18nRunning?: boolean }
    if (win.__fabricI18nRunning) return
    win.__fabricI18nRunning = true

    // 초기 번역
    walkAndTranslate(document.body)

    // DOM 변경 감지 → 자동 재번역
    let timer: ReturnType<typeof setTimeout> | null = null
    const observer = new MutationObserver((mutations) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        for (const m of mutations) {
          if (m.type === "childList") {
            m.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) walkAndTranslate(node)
              else if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text)
            })
          }
        }
      }, 80)
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
      win.__fabricI18nRunning = false
    }
  }, [])

  return null
}

// 여러 페이지에서 실행되도록 복수 zone 등록
export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default KoreanTranslatorWidget
