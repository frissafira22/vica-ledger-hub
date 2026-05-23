import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AuditEntry,
  BlockchainLog,
  Order,
  OrderItem,
  PackingStatus,
  PaymentMethod,
  PaymentStatus,
  PickupStatus,
  Product,
  Role,
} from "./types";
import { INITIAL_PRODUCTS } from "./catalog";
import { simulateHash } from "./utils-format";

const LS_KEY = "vica-blockledger-state-v2";

interface State {
  products: Product[];
  orders: Order[];
  audit: AuditEntry[];
  blockchain: BlockchainLog[];
  counter: number;
  auditCounter: number;
  chainCounter: number;
}

export interface RecordChainInput {
  orderId: string;
  orderHash: string;
  action: string;
  actionLabel: string;
  txHash: string;
  walletAddress?: string;
  network: string;
  contract: string;
  status: "Simulated" | "Confirmed";
  role: Role | "system";
  actor: string;
}

interface DataContextValue extends State {
  updateProductPrice: (code: string, price: number) => void;
  createOrder: (input: {
    customerName: string;
    customerPhone: string;
    items: { productCode: string; boxes: number }[];
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    notes?: string;
    actor: string;
  }) => Order;
  setPaymentStatus: (orderId: string, status: PaymentStatus, actor: string, role: Role, note?: string) => void;
  setPackingStatus: (orderId: string, status: PackingStatus, actor: string, role: Role) => void;
  confirmPickup: (orderId: string, actor: string, role: Role) => void;
  markIssue: (orderId: string, actor: string, role: Role, note?: string) => void;
  addAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  recordChainTx: (entry: RecordChainInput) => BlockchainLog;
}

const DataContext = createContext<DataContextValue | null>(null);

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}

function buildItem(product: Product, boxes: number): OrderItem {
  return {
    productCode: product.code,
    productName: product.name,
    unitsPerBox: product.unitsPerBox,
    boxes,
    pricePerBox: product.pricePerBox,
    subtotal: product.pricePerBox * boxes,
  };
}

function seedOrders(products: Product[]): { orders: Order[]; audit: AuditEntry[]; counter: number; auditCounter: number } {
  const seeds: { customer: string; phone: string; code: string; boxes: number; payment: PaymentStatus; packing: PackingStatus; pickup: PickupStatus; method: PaymentMethod }[] = [
    { customer: "Rina Store", phone: "081234500001", code: "VCA-BM-VA", boxes: 3, payment: "Sudah Diambil" as never, packing: "Siap Diambil", pickup: "Sudah Diambil", method: "Transfer Bank" },
    { customer: "Cantika Beauty", phone: "081234500002", code: "VCA-HB-BP", boxes: 4, payment: "Terverifikasi", packing: "Siap Diambil", pickup: "Belum Diambil", method: "Transfer Bank" },
    { customer: "Sari Cosmetics", phone: "081234500003", code: "VCA-EDP-FM", boxes: 2, payment: "Terverifikasi", packing: "Dipacking", pickup: "Belum Diambil", method: "Dompet Digital" },
    { customer: "Lestari Mart", phone: "081234500004", code: "VCA-BW-VA", boxes: 5, payment: "Terverifikasi", packing: "Belum Dipacking", pickup: "Belum Diambil", method: "Transfer Bank" },
    { customer: "Ayu Grosir", phone: "081234500005", code: "VCA-EDT-BP", boxes: 3, payment: "Menunggu Verifikasi", packing: "Belum Dipacking", pickup: "Belum Diambil", method: "Tunai" },
    { customer: "Melati Shop", phone: "081234500006", code: "VCA-BM-FM", boxes: 2, payment: "Menunggu Verifikasi", packing: "Belum Dipacking", pickup: "Belum Diambil", method: "Transfer Bank" },
    { customer: "Nabila Beauty", phone: "081234500007", code: "VCA-HB-VA", boxes: 6, payment: "Terverifikasi", packing: "Siap Diambil", pickup: "Belum Diambil", method: "Dompet Digital" },
    { customer: "Fresh Care Store", phone: "081234500008", code: "VCA-BW-FM", boxes: 4, payment: "Bermasalah", packing: "Belum Dipacking", pickup: "Belum Diambil", method: "Lainnya" },
    { customer: "Putri Collection", phone: "081234500009", code: "VCA-EDP-VA", boxes: 2, payment: "Terverifikasi", packing: "Dipacking", pickup: "Belum Diambil", method: "Transfer Bank" },
    { customer: "Glow Market", phone: "081234500010", code: "VCA-EDT-FM", boxes: 3, payment: "Gagal", packing: "Belum Dipacking", pickup: "Belum Diambil", method: "Transfer Bank" },
  ];

  const orders: Order[] = [];
  const audit: AuditEntry[] = [];
  let auditCounter = 0;
  const baseDate = new Date("2026-01-15T09:00:00");

  seeds.forEach((s, i) => {
    const idx = i + 1;
    const product = products.find((p) => p.code === s.code)!;
    const item = buildItem(product, s.boxes);
    const totalBoxes = item.boxes;
    const totalPcs = item.boxes * item.unitsPerBox;
    const totalAmount = item.subtotal;
    const id = `TRX-2026-${pad(idx)}`;
    const invoice = `INV-2026-${pad(idx)}`;
    const pickupCode = `PICK-2026-${pad(idx)}`;
    const ts = new Date(baseDate.getTime() + i * 3600_000).toISOString();
    const hash = simulateHash([id, invoice, s.customer, item.productCode, totalBoxes, totalAmount, ts].join("|"));

    const realPayment: PaymentStatus = (s.payment as string) === "Sudah Diambil" ? "Terverifikasi" : (s.payment as PaymentStatus);

    orders.push({
      id, invoice, pickupCode, hash,
      customerName: s.customer, customerPhone: s.phone,
      items: [item], totalBoxes, totalPcs, totalAmount,
      paymentMethod: s.method, paymentStatus: realPayment,
      packingStatus: s.packing, pickupStatus: s.pickup,
      notes: undefined, createdAt: ts, createdBy: "Admin",
    });

    const push = (activity: string, role: Role | "system" = "admin", actor = "Admin", offset = 0) => {
      auditCounter += 1;
      audit.push({
        id: `AUD-${pad(auditCounter, 4)}`,
        orderId: id, activity, role, actor,
        timestamp: new Date(baseDate.getTime() + i * 3600_000 + offset).toISOString(),
        notes: undefined,
      });
    };

    push("Order dibuat", "admin", "Admin", 0);
    push(`Hash transaksi dibuat: ${hash.slice(0, 18)}…`, "system", "system", 1000);
    if (realPayment === "Terverifikasi") push("Pembayaran diverifikasi", "admin", "Admin", 60_000);
    if (s.payment === "Bermasalah") push("Transaksi ditandai bermasalah", "admin", "Admin", 60_000);
    if (s.payment === "Gagal") push("Transaksi ditandai gagal", "admin", "Admin", 60_000);
    if (s.packing === "Dipacking" || s.packing === "Siap Diambil") push("Mulai packing", "gudang", "Gudang", 120_000);
    if (s.packing === "Siap Diambil") push("Ditandai siap diambil", "gudang", "Gudang", 180_000);
    if (s.pickup === "Sudah Diambil") push("Barang dikonfirmasi sudah diambil oleh Staf Toko", "toko", "Staf Toko", 240_000);
  });

  return { orders, audit, counter: seeds.length, auditCounter };
}

function loadInitial(): State {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (!parsed.blockchain) parsed.blockchain = [];
        if (parsed.chainCounter == null) parsed.chainCounter = 0;
        return parsed;
      }
    } catch {}
  }
  const seeded = seedOrders(INITIAL_PRODUCTS);
  return {
    products: INITIAL_PRODUCTS,
    ...seeded,
    blockchain: [],
    chainCounter: 0,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo<DataContextValue>(() => {
    const addAuditInternal = (
      prev: State,
      entry: Omit<AuditEntry, "id" | "timestamp">,
    ): State => {
      const next = prev.auditCounter + 1;
      return {
        ...prev,
        auditCounter: next,
        audit: [
          ...prev.audit,
          { ...entry, id: `AUD-${pad(next, 4)}`, timestamp: new Date().toISOString() },
        ],
      };
    };

    return {
      ...state,
      updateProductPrice: (code, price) => {
        setState((prev) => ({
          ...prev,
          products: prev.products.map((p) => (p.code === code ? { ...p, pricePerBox: price } : p)),
        }));
      },
      createOrder: ({ customerName, customerPhone, items, paymentMethod, paymentStatus, notes, actor }) => {
        let created!: Order;
        setState((prev) => {
          const idx = prev.counter + 1;
          const id = `TRX-2026-${pad(idx)}`;
          const invoice = `INV-2026-${pad(idx)}`;
          const pickupCode = `PICK-2026-${pad(idx)}`;
          const orderItems: OrderItem[] = items.map((it) => {
            const product = prev.products.find((p) => p.code === it.productCode)!;
            return buildItem(product, it.boxes);
          });
          const totalBoxes = orderItems.reduce((s, it) => s + it.boxes, 0);
          const totalPcs = orderItems.reduce((s, it) => s + it.boxes * it.unitsPerBox, 0);
          const totalAmount = orderItems.reduce((s, it) => s + it.subtotal, 0);
          const ts = new Date().toISOString();
          const hash = simulateHash(
            [id, invoice, customerName, ...orderItems.map((i) => i.productCode), totalBoxes, totalAmount, ts].join("|"),
          );
          created = {
            id, invoice, pickupCode, hash,
            customerName, customerPhone, items: orderItems,
            totalBoxes, totalPcs, totalAmount,
            paymentMethod, paymentStatus,
            packingStatus: "Belum Dipacking", pickupStatus: "Belum Diambil",
            notes, createdAt: ts, createdBy: actor,
          };

          let next: State = { ...prev, counter: idx, orders: [created, ...prev.orders] };
          next = addAuditInternal(next, { orderId: id, activity: "Order dibuat", role: "admin", actor, notes });
          next = addAuditInternal(next, {
            orderId: id,
            activity: `Hash transaksi dibuat: ${hash.slice(0, 18)}…`,
            role: "system", actor: "system",
          });
          if (paymentStatus === "Terverifikasi") {
            next = addAuditInternal(next, { orderId: id, activity: "Pembayaran diverifikasi", role: "admin", actor });
          }
          return next;
        });
        return created;
      },
      setPaymentStatus: (orderId, status, actor, role, note) => {
        setState((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          const orders = prev.orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o));
          let next: State = { ...prev, orders };
          next = addAuditInternal(next, {
            orderId,
            activity: `Status pembayaran diubah ke ${status}`,
            role, actor, notes: note,
          });
          return next;
        });
      },
      setPackingStatus: (orderId, status, actor, role) => {
        setState((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          if (order.paymentStatus !== "Terverifikasi") return prev;
          if (status === "Dipacking" && order.packingStatus !== "Belum Dipacking") return prev;
          if (status === "Siap Diambil" && order.packingStatus !== "Dipacking") return prev;
          const orders = prev.orders.map((o) => (o.id === orderId ? { ...o, packingStatus: status } : o));
          let next: State = { ...prev, orders };
          const activity = status === "Dipacking" ? "Mulai packing" : "Ditandai siap diambil";
          next = addAuditInternal(next, { orderId, activity, role, actor });
          return next;
        });
      },
      confirmPickup: (orderId, actor, role) => {
        setState((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          if (order.paymentStatus !== "Terverifikasi") return prev;
          if (order.packingStatus !== "Siap Diambil") return prev;
          if (order.pickupStatus !== "Belum Diambil") return prev;
          const orders = prev.orders.map((o) =>
            o.id === orderId ? { ...o, pickupStatus: "Sudah Diambil" as PickupStatus } : o,
          );
          let next: State = { ...prev, orders };
          next = addAuditInternal(next, {
            orderId,
            activity: "Barang dikonfirmasi sudah diambil oleh Staf Toko",
            role, actor,
          });
          return next;
        });
      },
      markIssue: (orderId, actor, role, note) => {
        setState((prev) => {
          const orders = prev.orders.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: "Bermasalah" as PaymentStatus } : o,
          );
          let next: State = { ...prev, orders };
          next = addAuditInternal(next, {
            orderId,
            activity: "Transaksi ditandai bermasalah",
            role, actor, notes: note,
          });
          return next;
        });
      },
      addAudit: (entry) => {
        setState((prev) => addAuditInternal(prev, entry));
      },
      recordChainTx: (entry) => {
        let created!: BlockchainLog;
        setState((prev) => {
          const next = prev.chainCounter + 1;
          created = {
            id: `BLK-${pad(next, 4)}`,
            timestamp: new Date().toISOString(),
            ...entry,
          };
          const audited = addAuditInternal({ ...prev, chainCounter: next, blockchain: [created, ...prev.blockchain] }, {
            orderId: entry.orderId,
            activity: `Blockchain: ${entry.actionLabel} · tx ${entry.txHash.slice(0, 12)}…`,
            role: "system",
            actor: entry.walletAddress ? `wallet ${entry.walletAddress.slice(0, 6)}…${entry.walletAddress.slice(-4)}` : "system",
            notes: entry.status === "Simulated" ? "Simulated (no real chain submission)" : undefined,
          });
          return audited;
        });
        return created;
      },
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
