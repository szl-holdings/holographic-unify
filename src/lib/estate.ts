import { createServerFn } from "@tanstack/react-start";
import { DIAGNOSIS, SPACES, type SpaceStage } from "./catalog";
import { HF_SOFTWARE } from "./sota";

export type LiveSpace = {
  id: string;
  sdk: string;
  stage: SpaceStage;
  error: string;
  likes: number;
};

export type LiveModel = {
  id: string;
  tag: string | null;
  likes: number;
  downloads: number;
};

export type HubSotaRow = {
  id: string;
  tag: string | null;
  likes: number;
  downloads: number;
};

export type EstateSnapshot = {
  fetchedAt: string;
  spaces: LiveSpace[];
  models: LiveModel[];
  datasetCount: number;
  hubSota: HubSotaRow[];
  error: string | null;
};

const HF = "https://huggingface.co/api";

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "szl-estate-command/2.0" },
    signal: AbortSignal.timeout(18000),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

async function runtimeOf(name: string): Promise<{ stage: SpaceStage; error: string }> {
  try {
    const data = (await getJson(`${HF}/spaces/SZLHOLDINGS/${name}/runtime`)) as {
      stage?: string;
      errorMessage?: string;
    };
    const stage = (data.stage || "UNKNOWN") as SpaceStage;
    return { stage, error: data.errorMessage ?? "" };
  } catch (err) {
    const known = DIAGNOSIS.find((d) => d.id === name);
    if (known) return { stage: known.stage, error: known.error };
    return { stage: "UNKNOWN", error: err instanceof Error ? err.message : "UNAVAILABLE" };
  }
}

function fallbackHubSota(): HubSotaRow[] {
  return HF_SOFTWARE.filter((s) => s.origin === "frontier").map((s) => ({
    id: s.id,
    tag: s.job,
    likes: 0,
    downloads: 0,
  }));
}

export const loadEstate = createServerFn({ method: "GET" }).handler(async (): Promise<EstateSnapshot> => {
  try {
    const [spacesRaw, modelsRaw, datasetsRaw, hubSotaRaw] = await Promise.all([
      getJson(`${HF}/spaces?author=SZLHOLDINGS&limit=100`),
      getJson(`${HF}/models?author=SZLHOLDINGS&limit=100`),
      getJson(`${HF}/datasets?author=SZLHOLDINGS&limit=100`),
      getJson(`${HF}/models?sort=downloads&direction=-1&limit=24`).catch(() => null),
    ]);

    const spaceList = Array.isArray(spacesRaw) ? spacesRaw : [];
    const names = spaceList.map((s: { id?: string }) => (s.id ?? "").replace("SZLHOLDINGS/", "")).filter(Boolean);

    const runtimes = await Promise.all(names.map((n: string) => runtimeOf(n)));

    const spaces: LiveSpace[] = spaceList.map((s: { id?: string; sdk?: string; likes?: number }, i: number) => {
      const id = (s.id ?? "").replace("SZLHOLDINGS/", "");
      const rt = runtimes[i] ?? { stage: "UNKNOWN" as SpaceStage, error: "" };
      return {
        id,
        sdk: s.sdk ?? SPACES.find((x) => x.id === id)?.sdk ?? "unknown",
        stage: rt.stage,
        error: rt.error,
        likes: s.likes ?? 0,
      };
    });

    const models: LiveModel[] = (Array.isArray(modelsRaw) ? modelsRaw : []).map(
      (m: { id?: string; pipeline_tag?: string; likes?: number; downloads?: number }) => ({
        id: (m.id ?? "").replace("SZLHOLDINGS/", ""),
        tag: m.pipeline_tag ?? null,
        likes: m.likes ?? 0,
        downloads: m.downloads ?? 0,
      }),
    );

    const hubSota: HubSotaRow[] = (Array.isArray(hubSotaRaw) ? hubSotaRaw : []).map(
      (m: { id?: string; pipeline_tag?: string; likes?: number; downloads?: number }) => ({
        id: m.id ?? "",
        tag: m.pipeline_tag ?? null,
        likes: m.likes ?? 0,
        downloads: m.downloads ?? 0,
      }),
    );

    return {
      fetchedAt: new Date().toISOString(),
      spaces,
      models,
      datasetCount: Array.isArray(datasetsRaw) ? datasetsRaw.length : 0,
      hubSota: hubSota.length ? hubSota : fallbackHubSota(),
      error: null,
    };
  } catch (err) {
    return {
      fetchedAt: new Date().toISOString(),
      spaces: DIAGNOSIS.map((d) => ({
        id: d.id,
        sdk: SPACES.find((s) => s.id === d.id)?.sdk ?? "docker",
        stage: d.stage,
        error: d.error,
        likes: 0,
      })),
      models: [],
      datasetCount: 28,
      hubSota: fallbackHubSota(),
      error: err instanceof Error ? err.message : "UNAVAILABLE",
    };
  }
});
