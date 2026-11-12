"use client";
import React, { useEffect, useState } from "react";

/**
 * Simple admin page for viewing recent FASTag gate events.
 * Requires a user with ADMIN role – auth is enforced at the API route.
 */
export default function FastagAdminPage() {
  const [events, setEvents] = useState<Array<{
    id: string;
    tagId: string;
    vehicleRegNumber: string;
    gateType: string;
    timestamp: string;
    authorized: boolean;
    actionTaken: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/telematics/fastag/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events ?? []);
        } else {
          console.error("Failed to load FASTag events", res.status);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="p-4">Loading FASTag events…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">FASTag Gate Events</h1>
      {events.length === 0 ? (
        <p>No gate events recorded.</p>
      ) : (
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Tag ID</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Gate</th>
              <th className="px-4 py-2">Authorized</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">{new Date(e.timestamp).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2">{e.tagId}</td>
                <td className="px-4 py-2">{e.vehicleRegNumber}</td>
                <td className="px-4 py-2">{e.gateType}</td>
                <td className="px-4 py-2">{e.authorized ? "Yes" : "No"}</td>
                <td className="px-4 py-2">{e.actionTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

