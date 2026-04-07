import { defineWidgetConfig } from "@medusajs/admin-sdk"
import KoreanTranslatorWidget from "./korean-translator"

// 커스텀 대시보드 페이지에도 번역기 등록
export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default KoreanTranslatorWidget
