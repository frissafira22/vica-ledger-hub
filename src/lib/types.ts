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
  id: string;
  invoice: string;
  pickupCode: string;
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
  id: string;
  orderId: string;
  activity: string;
  role: Role | "system";
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface BlockchainLog {
  id: string; // BLK-0001
  orderId: string;
  orderHash: string;
  action: string; // BlockchainAction code
  actionLabel: string;
  txHash: string;
  walletAddress?: string;
  network: string;
  contract: string;
  status: "Simulated" | "Confirmed";
  role: Role | "system";
  actor: string;
  timestamp: string;
}
