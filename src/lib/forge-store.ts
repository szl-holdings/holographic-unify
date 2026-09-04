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
import type { LoopStamp } from "./evolve";
import type { ServeOk } from "./serve";

type LoopMode = "evolve" | "september" | "loop" | "circuit";

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
  loopCursor: number;
  loopStamps: LoopStamp[];
  loopClosed: boolean;
  loopMode: LoopMode;
  loopResult: ServeOk | null;
  loopError: string | null;
  setMethod: (m: PeftMethod) => void;
  setSku: (s: AdapterSku) => void;
  setRank: (n: number) => void;
  setAlpha: (n: number) => void;
  toggleModule: (m: TargetModule) => void;
  setQuant: (q: Quant) => void;
  setKeyed: (k: boolean) => void;
  setFrontier: (id: string) => void;
  setLoopCursor: (n: number) => void;
  setLoopStamps: (stamps: LoopStamp[] | ((prev: LoopStamp[]) => LoopStamp[])) => void;
  setLoopClosed: (closed: boolean) => void;
  setLoopMode: (mode: LoopMode) => void;
  setLoopResult: (result: ServeOk | null) => void;
  setLoopError: (error: string | null) => void;
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
  loopCursor: 0,
  loopStamps: [],
  loopClosed: false,
  loopMode: "loop",
  loopResult: null,
  loopError: null,
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
  setLoopCursor: (loopCursor) => set({ loopCursor }),
  setLoopStamps: (stamps) =>
    set((s) => ({ loopStamps: typeof stamps === "function" ? stamps(s.loopStamps) : stamps })),
  setLoopClosed: (loopClosed) => set({ loopClosed }),
  setLoopMode: (loopMode) => set({ loopMode }),
  setLoopResult: (loopResult) => set({ loopResult }),
  setLoopError: (loopError) => set({ loopError }),
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
