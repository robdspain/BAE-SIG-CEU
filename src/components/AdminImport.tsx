import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AdminImport() {
    const checkIn = useMutation(api.attendees.checkIn);
    const activeEvent = useQuery(api.events.getActive);
    const createEvent = useMutation(api.events.create);
    
    const [importing, setImporting] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const data = JSON.parse(text);
                
                if (!Array.isArray(data)) {
                    alert("JSON must be an array of objects");
                    return;
                }
                
                setImporting(true);
                setLogs(prev => [...prev, "Starting import..."]);

                // Ensure we have an event to attach these to
                let eventId = activeEvent?._id;
                
                if (!eventId) {
                     setLogs(prev => [...prev, "No active event found. Creating 'Legacy Import Event'..."]);
                     eventId = await createEvent({
                         title: "Imported Legacy Event",
                         date: new Date().toISOString(),
                         hours: 1.0, // Default
                         type: "Learning",
                         providerId: "LEGACY",
                         instructorName: "Various",
                         aceCoordinatorName: "System",
                         status: "published",
                         isArchived: false
                     });
                }

                let count = 0;
                for (const row of data) {
                    try {
                        // Map legacy fields
                        // Expects: firstName, lastName, email, bcbaNumber
                        if (!row.email || !row.lastName) {
                            console.warn("Skipping invalid row", row);
                            continue;
                        }

                        await checkIn({
                            eventId: eventId!,
                            firstName: row.firstName || "Unknown",
                            lastName: row.lastName || "Unknown",
                            email: row.email,
                            bcbaNumber: row.bcbaNumber,
                            rbtNumber: row.rbtNumber
                        });
                        count++;
                        if (count % 10 === 0) setLogs(prev => [...prev, `Imported ${count} records...`]);
                    } catch (err) {
                        console.error("Failed row:", row, err);
                        setLogs(prev => [...prev, `Failed to import ${row.email}`]);
                    }
                }
                setLogs(prev => [...prev, `SUCCESS! Imported ${count} records.`]);

            } catch (err) {
                console.error(err);
                alert("Error parsing JSON file");
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 bg-white rounded shadow-md mt-8 border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Admin: Import Legacy Data</h2>
            <p className="text-sm text-gray-600 mb-4">
                Select a JSON file (array of attendees) to import into the active event (or create a new one).
            </p>
            
            <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload} 
                disabled={importing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            <div className="mt-4 h-48 overflow-y-auto bg-gray-900 text-green-400 font-mono p-4 rounded text-xs">
                {logs.length === 0 ? "> Ready for import..." : logs.map((log, i) => <div key={i}>{log}</div>)}
                {importing && <div className="animate-pulse">Processing...</div>}
            </div>
        </div>
    )
}
