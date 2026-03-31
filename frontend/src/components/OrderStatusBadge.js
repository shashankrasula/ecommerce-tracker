import React from 'react';
import { STATUS_COLORS, PAYMENT_COLORS, PRIORITY_COLORS, capitalize } from '../utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400'}`}>
    {capitalize(status)}
  </span>
);

export const PaymentBadge = ({ status }) => (
  <span className={`badge ${PAYMENT_COLORS[status] || ''}`}>
    {capitalize(status)}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY_COLORS[priority] || ''}`}>
    {capitalize(priority)}
  </span>
);

export const TrackingTimeline = ({ history }) => {
  if (!history?.length) return <p className="text-slate-500 text-sm">No tracking history</p>;

  return (
    <div className="space-y-3">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-blue-500 ring-2 ring-blue-500/30' : 'bg-slate-600'}`} />
          <div className={i === 0 ? 'border-l-2 border-blue-500/30 pl-3 pb-2' : 'border-l-2 border-slate-700 pl-3 pb-2'}>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={h.status} />
              {h.location && <span className="text-slate-400 text-xs">📍 {h.location}</span>}
            </div>
            {h.description && <p className="text-slate-300 text-sm mt-0.5">{h.description}</p>}
            <p className="text-slate-500 text-xs mt-0.5">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProgressStepper = ({ currentStatus }) => {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIdx = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) return (
    <div className="flex items-center justify-center py-4">
      <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-sm px-4 py-2">❌ Order Cancelled</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1 w-full overflow-x-auto py-2">
      {steps.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                active ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-110' :
                done ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-500'
              }`}>
                {done && !active ? '✓' : idx + 1}
              </div>
              <p className={`text-[9px] mt-1 text-center capitalize max-w-[56px] leading-tight ${active ? 'text-blue-400 font-semibold' : done ? 'text-green-400' : 'text-slate-500'}`}>
                {step.replace(/_/g, ' ')}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 rounded-full ${idx < currentIdx ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
