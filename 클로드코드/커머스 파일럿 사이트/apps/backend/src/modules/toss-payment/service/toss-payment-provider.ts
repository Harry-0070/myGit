import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import type {
  ProviderWebhookPayload,
  WebhookActionResult,
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
} from "@medusajs/types"

type TossPaymentOptions = {
  secretKey: string
  clientKey: string
}

interface TossPaymentResult {
  paymentKey: string
  status: string
  [key: string]: unknown
}

interface TossErrorResult {
  message?: string
  code?: string
  [key: string]: unknown
}

/**
 * 토스페이먼츠 커스텀 Payment Provider
 * AbstractPaymentProvider 상속 — PoC 기본 구조
 */
class TossPaymentProviderService extends AbstractPaymentProvider<TossPaymentOptions> {
  static identifier = "toss-payment"

  private readonly TOSS_API_BASE = "https://api.tosspayments.com/v1"

  private getAuthHeader(): string {
    const encoded = Buffer.from(`${this.config.secretKey}:`).toString("base64")
    return `Basic ${encoded}`
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { currency_code, amount, context } = input
    const orderId = (context as Record<string, unknown>)?.resource_id as string | undefined
    return {
      id: orderId || `toss_${Date.now()}`,
      data: {
        status: "pending",
        amount,
        currency: currency_code,
        orderId,
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const { data } = input
    const { paymentKey, orderId, amount } = data as {
      paymentKey?: string
      orderId?: string
      amount?: number
    }

    if (!paymentKey || !orderId || amount === undefined) {
      return {
        status: "pending",
        data: { ...(data as Record<string, unknown>), status: "pending" },
      }
    }

    try {
      const response = await fetch(`${this.TOSS_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      })

      if (!response.ok) {
        const result = (await response.json()) as TossErrorResult
        throw new Error(result.message || "토스페이먼츠 결제 승인 실패")
      }

      const result = (await response.json()) as TossPaymentResult
      return {
        status: "authorized",
        data: {
          ...(data as Record<string, unknown>),
          paymentKey,
          tossPaymentId: result.paymentKey,
          tossStatus: result.status,
        },
      }
    } catch (e: unknown) {
      throw e
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: { ...(input.data as Record<string, unknown>), status: "captured" } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const paymentKey = (input.data as Record<string, unknown>)?.paymentKey as string | undefined

    if (!paymentKey) {
      return { data: { ...(input.data as Record<string, unknown>), status: "canceled" } }
    }

    try {
      const response = await fetch(
        `${this.TOSS_API_BASE}/payments/${paymentKey}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancelReason: "고객 요청 취소" }),
        }
      )

      if (!response.ok) {
        const result = (await response.json()) as TossErrorResult
        throw new Error(result.message || "취소 실패")
      }

      const result = (await response.json()) as Record<string, unknown>
      return { data: { ...(input.data as Record<string, unknown>), status: "canceled", cancelData: result } }
    } catch (e: unknown) {
      throw e
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentKey = (input.data as Record<string, unknown>)?.paymentKey as string | undefined
    const refundAmount = input.amount

    if (!paymentKey) {
      return { data: { ...(input.data as Record<string, unknown>), status: "refunded" } }
    }

    try {
      const response = await fetch(
        `${this.TOSS_API_BASE}/payments/${paymentKey}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelReason: "환불 요청",
            cancelAmount: refundAmount,
          }),
        }
      )

      if (!response.ok) {
        const result = (await response.json()) as TossErrorResult
        throw new Error(result.message || "환불 실패")
      }

      const result = (await response.json()) as Record<string, unknown>
      return { data: { ...(input.data as Record<string, unknown>), status: "refunded", refundData: result } }
    } catch (e: unknown) {
      throw e
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentKey = (input.data as Record<string, unknown>)?.paymentKey as string | undefined

    if (!paymentKey) {
      return { data: input.data as Record<string, unknown> }
    }

    try {
      const response = await fetch(`${this.TOSS_API_BASE}/payments/${paymentKey}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      if (!response.ok) {
        const result = (await response.json()) as TossErrorResult
        throw new Error(result.message || "조회 실패")
      }

      const result = (await response.json()) as Record<string, unknown>
      return { data: { ...(input.data as Record<string, unknown>), ...result } }
    } catch (e: unknown) {
      throw e
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data as Record<string, unknown> }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data as Record<string, unknown> }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = (input.data as Record<string, unknown>)?.tossStatus as string | undefined
    switch (status) {
      case "DONE":
        return { status: "captured" }
      case "CANCELED":
      case "PARTIAL_CANCELED":
        return { status: "canceled" }
      case "ABORTED":
        return { status: "error" }
      default:
        return { status: "pending" }
    }
  }

  async getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return {
      action: "not_supported",
      data: {
        session_id: "",
        amount: 0,
      },
    }
  }
}

export default TossPaymentProviderService
