/**
 * History – historical sensor readings with filtering
 *
 * Displays a table of past sensor readings with date filtering.
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

export default function History() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startTime = useMemo(
    () => (startDate ? new Date(startDate).getTime() : undefined),
    [startDate]
  );
  const endTime = useMemo(
    () => (endDate ? new Date(endDate + "T23:59:59").getTime() : undefined),
    [endDate]
  );

  const readings = useQuery(api.sensorReadings.getHistory, {
    startTime,
    endTime,
    limit: 200,
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Clock className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground">
              Historical sensor readings from the database
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Filter by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
              {(startDate || endDate) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Sensor Readings ({readings?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!readings || readings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No readings found. Data will appear once the ESP32 starts sending readings.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                        Time
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        pH
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        TDS (ppm)
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        Turbidity (NTU)
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        Temp (°C)
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        Flow (L/min)
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                        Pump
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                        Solenoid
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                        UV
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => (
                      <tr key={r._id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-right tabular-nums font-medium">
                          {r.ph.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-xs text-right tabular-nums">
                          {r.tds}
                        </td>
                        <td className="px-3 py-2 text-xs text-right tabular-nums">
                          {r.turbidity}
                        </td>
                        <td className="px-3 py-2 text-xs text-right tabular-nums">
                          {r.temperature}
                        </td>
                        <td className="px-3 py-2 text-xs text-right tabular-nums">
                          {r.flowRate.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          <span
                            className={
                              r.pumpStatus
                                ? "text-emerald-600 font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {r.pumpStatus ? "ON" : "OFF"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          <span
                            className={
                              r.solenoidStatus
                                ? "text-emerald-600 font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {r.solenoidStatus ? "OPEN" : "CLOSED"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          <span
                            className={
                              r.uvStatus
                                ? "text-emerald-600 font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {r.uvStatus ? "ON" : "OFF"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
