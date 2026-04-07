import { defineWidgetConfig } from "@medusajs/admin-sdk"
import KoreanTranslatorWidget from "./korean-translator"

// 상품 목록 페이지에도 번역기 등록 (중복 실행은 내부에서 방지됨)
export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default KoreanTranslatorWidget
