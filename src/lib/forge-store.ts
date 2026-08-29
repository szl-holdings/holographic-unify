import { create } from "zustand";
import {
  composeCut,
  defaultQuant,
  type AdapterCut,
  type AdapterSku,
  type PeftMethod,
  type Quant,
  type TargetModule,
} from "./peft";

type ForgeState = {
  method: PeftMethod;
  sku: AdapterSku;
  rank: number;
  alpha: number;
  modules: TargetModule[];
  quant: Quant;
  keyed: boolean;
  cut: AdapterCut | null;
  frontier: string;
  setMethod: (m: PeftMethod) => void;
  setSku: (s: AdapterSku) => void;
  setRank: (n: number) => void;
  setAlpha: (n: number) => void;
  toggleModule: (m: TargetModule) => void;
  setQuant: (q: Quant) => void;
  setKeyed: (k: boolean) => void;
  setFrontier: (id: string) => void;
  cutAdapter: () => AdapterCut;
};

export const useForge = create<ForgeState>()((set, get) => ({
  method: "qlora",
  sku: "receipt-agent",
  rank: 16,
  alpha: 32,
  modules: ["q_proj", "v_proj"],
  quant: "nf4",
  keyed: false,
  cut: null,
  frontier: "evolve",
  setMethod: (method) => set({ method, quant: defaultQuant(method) }),
  setSku: (sku) => set({ sku }),
  setRank: (rank) => set({ rank }),
  setAlpha: (alpha) => set({ alpha }),
  toggleModule: (m) =>
    set((s) => {
      const has = s.modules.includes(m);
      const modules = has ? s.modules.filter((x) => x !== m) : [...s.modules, m];
      return { modules: modules.length ? modules : (["q_proj"] as TargetModule[]) };
    }),
  setQuant: (quant) => set({ quant }),
  setKeyed: (keyed) => set({ keyed }),
  setFrontier: (frontier) => set({ frontier }),
  cutAdapter: () => {
    const s = get();
    const cut = composeCut({
      sku: s.sku,
      method: s.method,
      rank: s.rank,
      alpha: s.alpha,
      modules: s.modules,
      quant: s.quant,
      keyed: s.keyed,
    });
    set({ cut });
    return cut;
  },
}));
