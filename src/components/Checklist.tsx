import type { ChecklistItem } from '../types';
import { getZoneLabel } from '../types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  readOnly?: boolean;
}

export default function Checklist({ items, onToggle, readOnly = false }: ChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group items by zone
  const groupedItems = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.zone]) {
      acc[item.zone] = [];
    }
    acc[item.zone].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const activeZones = Object.keys(groupedItems);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">진행률</span>
          <span className="text-sm font-bold text-green-500">
            {completedCount}/{totalCount} ({percentage}%)
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Grouped Checklist Items */}
      <div className="space-y-3">
        {activeZones.map((zone) => (
          <div key={zone} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Zone Header */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">{getZoneLabel(zone)}</span>
              <span className="ml-2 text-xs text-gray-400">
                {groupedItems[zone].filter((i) => i.completed).length}/{groupedItems[zone].length}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {groupedItems[zone].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    readOnly ? '' : 'cursor-pointer active:bg-gray-50'
                  } transition-colors`}
                >
                  <div
                    onClick={(e) => {
                      if (readOnly) return;
                      e.preventDefault();
                      onToggle(item.id);
                    }}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 bg-white'
                    } ${readOnly ? '' : 'cursor-pointer'}`}
                  >
                    {item.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {item.task}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
