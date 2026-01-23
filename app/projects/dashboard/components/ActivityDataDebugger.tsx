"use client";

import { useEffect, useState } from "react";

export function ActivityDataDebugger() {
  const [activities, setActivities] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/activities?limit=100");
        const data = await response.json();
        console.log('=== RAW API RESPONSE ===');
        console.log(JSON.stringify(data, null, 2));
        
        setActivities(data.activities || []);
        
        // Group by type
        const byType: any = {};
        (data.activities || []).forEach((a: any) => {
          byType[a.type] = (byType[a.type] || 0) + 1;
        });
        
        console.log('=== ACTIVITY TYPES ===');
        Object.entries(byType).forEach(([type, count]) => {
          console.log(`${type}: ${count}`);
        });
        
        // Find activities with HTML content
        const htmlActivities = (data.activities || []).filter(
          (a: any) => a.content && (a.content.includes('<') || a.content.includes('&nbsp;'))
        );
        
        console.log('=== ACTIVITIES WITH HTML/ENTITIES ===');
        console.log(`Found: ${htmlActivities.length}`);
        htmlActivities.forEach((note: any) => {
          console.log(`Type: ${note.type}`);
          console.log(`Content length: ${note.content.length}`);
          console.log(`Content first 300 chars:`, note.content.substring(0, 300));
          console.log('---');
        });
        
        setNotes(htmlActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-red-900 border-2 border-red-700 rounded m-4">
      <h2 className="text-white font-bold mb-4">DEBUG: Activity Feed API Data</h2>
      
      <div className="text-white mb-4">
        <p className="mb-2"><strong>Total activities:</strong> {activities.length}</p>
        <p className="mb-2"><strong>Activities with HTML/entities:</strong> {notes.length}</p>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.slice(0, 5).map((note, idx) => (
            <div key={idx} className="p-3 bg-slate-900 rounded border border-red-700">
              <p className="text-yellow-300 font-mono text-xs mb-2">
                <strong>Type:</strong> {note.type}
              </p>
              <p className="text-red-300 font-mono text-xs mb-2">
                <strong>Content ({note.content.length} chars):</strong>
              </p>
              <div className="text-gray-300 font-mono text-xs whitespace-pre-wrap break-words mb-2 max-h-40 overflow-auto">
                {note.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-yellow-400">No activities with HTML/entities found</p>
      )}
    </div>
  );
}
