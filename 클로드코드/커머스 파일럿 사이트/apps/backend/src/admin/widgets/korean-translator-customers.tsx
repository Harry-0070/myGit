import { defineWidgetConfig } from "@medusajs/admin-sdk"
import KoreanTranslatorWidget from "./korean-translator"

// 고객 목록 페이지에도 번역기 등록
export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default KoreanTranslatorWidget
