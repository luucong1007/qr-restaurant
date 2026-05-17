// VietQR: Generate QR content theo chuẩn VietQR (EMVCo)
// Hoàn toàn miễn phí, không cần API key

interface VietQRParams {
  bankId: string      // Mã ngân hàng theo chuẩn VietQR (vd: 970415 = Vietinbank)
  accountNo: string   // Số tài khoản
  accountName: string // Tên chủ tài khoản
  amount: number      // Số tiền (VND)
  description: string // Nội dung chuyển khoản
}

export function buildVietQRUrl(params: VietQRParams): string {
  const { bankId, accountNo, accountName, amount, description } = params
  // VietQR img API - public, free, no key needed
  const base = 'https://img.vietqr.io/image'
  const encodedDesc = encodeURIComponent(description)
  const encodedName = encodeURIComponent(accountName)
  return `${base}/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`
}

// Danh sách bank ID phổ biến (BIN)
export const BANKS = {
  VIETCOMBANK: '970436',
  TECHCOMBANK: '970407',
  MBBANK: '970422',
  BIDV: '970418',
  VIETINBANK: '970415',
  AGRIBANK: '970405',
  TPBANK: '970423',
  MOMO: 'MOMO',
} as const
