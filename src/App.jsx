import { useEffect, useState } from "react";

const DATA_URL = "/bokning.json";

// Nu gör jag en hjälpfunktion som ska visa allt (alltså även objekt i objekt)
function renderValue(value) {
  if (value === null || value === undefined)
    return <span>{String(value)}</span>;

  if (Array.isArray(value)) {
    return (
      <ul style={{ margin: "6px 0 0 20px" }}>
        {value.map((v, i) => (
          <li key={i}>{renderValue(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <div style={{ marginTop: 6 }}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{k}</div>
            <div
              style={{
                background: "#f6f6f6",
                padding: 8,
                borderRadius: 12,
                border: "1px solid #333",
                overflowX: "auto",
              }}
            >
              {renderValue(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const res = await fetch(DATA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Något är fel och fungerar inte");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui",
      }}
    >
      <h1>Bokningsöversikt (React)</h1>
      <p>
        Hämtar data från: <code>{DATA_URL}</code>
      </p>

      {error && (
        <div style={{ padding: 12, border: "1px solid", marginTop: 12 }}>
          <strong>Fel:</strong> {error}
        </div>
      )}

      {!error && !data && <p>Laddar…</p>}

      {data && (
        <>
          {/* RESTAURANG */}
          <section style={{ marginTop: 18 }}>
            <h2>Restaurang</h2>
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 14,
                padding: 12,
              }}
            >
              {renderValue(data.restaurant)}
            </div>
          </section>

          {/* BOKNINGAR (bord & reservationer) */}
          <section style={{ marginTop: 18 }}>
            <h2>Bord & reservationer</h2>
            <p style={{ opacity: 0.8 }}>
              Antal bord: <strong>{data.tables?.length ?? 0}</strong>
            </p>

            {(data.tables || []).map((table) => (
              <article
                key={table.tableId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <header
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <strong>{table.tableId}</strong>
                  <span style={{ opacity: 0.75 }}>
                    {table.seats} platser • {table.area}
                  </span>
                </header>

                <div style={{ marginTop: 24 }}>
                  <h3 style={{ margin: "8px 0 24px" }}>Bord-info</h3>
                  {renderValue({
                    seats: table.seats,
                    area: table.area,
                    isAccessible: table.isAccessible,
                    minSpend: table.minSpend,
                  })}

                  <h3 style={{ margin: "42px 0 12px" }}>
                    Reservationer ({table.reservations?.length ?? 0})
                  </h3>

                  {(table.reservations || []).map((r) => (
                    <div
                      key={r.reservationId}
                      style={{
                        border: "2px solid #eee",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <strong>{r.reservationId}</strong>
                        <span style={{ opacity: 0.75 }}>{r.status}</span>
                      </div>

                      {/* Här visas allt i reservationen (även nested) */}
                      <div style={{ marginTop: 8 }}>{renderValue(r)}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {/* RÅDATA */}
          <section style={{ marginTop: 20 }}>
            <details>
              <summary>Visa hela JSON (rådata)</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </section>
        </>
      )}
    </div>
  );
}
