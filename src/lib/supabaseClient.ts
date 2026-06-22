// Phase 1 runs off bundled seed data; Supabase is intentionally not wired up here.
// This stub exists so any legacy import paths keep resolving without crashing the
// app at module load when Supabase env vars are absent in deployment.

type AnyFn = (...args: any[]) => any;

const unavailable: ProxyHandler<object> = {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const fn: AnyFn = () => {
      throw new Error(
        "Supabase is not configured in Phase 1. Data is served from seed files.",
      );
    };
    return new Proxy(fn, unavailable);
  },
  apply() {
    throw new Error(
      "Supabase is not configured in Phase 1. Data is served from seed files.",
    );
  },
};

export const supabase = new Proxy(function () {} as any, unavailable);
