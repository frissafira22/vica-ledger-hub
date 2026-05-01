export type Role = "admin" | "gudang" | "toko";

export type ProductCategory = "EDP" | "EDT" | "Body Mist" | "Hand Body" | "Body Wash";

export interface Product {
  code: string;
  name: string;
  category: ProductCategory;
  unitsPerBox: number;
  pricePerBox: number;
}

export type PaymentStatus = "Menunggu Verifikasi" | "Terverifikasi" | "Bermasalah" | "Gagal";
export type PackingStatus = "Belum Dipacking" | "Dipacking" | "Siap Diambil";
export type PickupStatus = "Belum Diambil" | "Sudah Diambil";
export type PaymentMethod = "Transfer Bank" | "Dompet Digital" | "Tunai" | "Lainnya";

export interface OrderItem {
  productCode: string;
  productName: string;
  unitsPerBox: number;
  boxes: number;
  pricePerBox: number;
  subtotal: number;
}

export interface Order {
  id: string; // TRX-2026-001
  invoice: string; // INV-2026-001
  pickupCode: string; // PICK-2026-001
  hash: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalBoxes: number;
  totalPcs: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  packingStatus: PackingStatus;
  pickupStatus: PickupStatus;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface AuditEntry {
  id: string; // AUD-001
  orderId: string;
  activity: string;
  role: Role | "system";
  actor: string;
  timestamp: string;
  notes?: string;
}
