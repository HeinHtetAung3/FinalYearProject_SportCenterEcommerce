import { useEffect, useState } from 'react';
import { IconClose } from '../ui/Icon';
import { classNames } from '../../utils/format';

/**
 * EU foot-length conversion table for the PDP size-selector "Size guide"
 * link. Numbers are rounded to one decimal place — they're a buying-aid
 * approximation, not a precise medical measurement, and match the
 * conversion charts most footwear retailers publish.
 */
const SIZE_TABLE = [
  { eu: 38, uk: 5, usMen: 6, usWomen: 7.5, cm: 24.0 },
  { eu: 39, uk: 6, usMen: 6.5, usWomen: 8, cm: 24.5 },
  { eu: 40, uk: 6.5, usMen: 7, usWomen: 8.5, cm: 25.0 },
  { eu: 41, uk: 7.5, usMen: 8, usWomen: 9.5, cm: 25.7 },
  { eu: 42, uk: 8, usMen: 8.5, usWomen: 10, cm: 26.5 },
  { eu: 43, uk: 9, usMen: 9.5, usWomen: 11, cm: 27.3 },
  { eu: 44, uk: 9.5, usMen: 10, usWomen: 11.5, cm: 28.0 },
  { eu: 45, uk: 10.5, usMen: 11, usWomen: 12.5, cm: 28.8 },
  { eu: 46, uk: 11, usMen: 11.5, usWomen: 13, cm: 29.5 }
];

const TABS = [
  { id: 'men', label: "Men's footwear" },
  { id: 'women', label: "Women's footwear" },
  { id: 'tips', label: 'How to measure' }
];

function SizeGuideModal({ open, onClose, availableEuSizes = [] }) {
  const [tab, setTab] = useState('men');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const availableSet = new Set(
    (availableEuSizes || []).map((value) => Number(value)).filter((n) => !Number.isNaN(n))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close size guide"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-card animate-slide-down sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
              Fit and sizing
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-ink-950">Size guide</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <div className="border-b border-ink-100 px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-none">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={classNames(
                  'border-b-2 pb-3 pt-3 text-sm font-semibold uppercase tracking-wider transition',
                  tab === entry.id
                    ? 'border-ink-950 text-ink-950'
                    : 'border-transparent text-ink-400 hover:text-ink-700'
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          {tab === 'tips' ? (
            <MeasureTips />
          ) : (
            <SizeTable
              tab={tab}
              availableSet={availableSet}
            />
          )}
        </div>

        <div className="border-t border-ink-100 px-6 py-4 text-xs text-ink-500">
          Sizes shown in <strong className="text-ink-700">bold</strong> are stocked for this style.
          Need help? Email <span className="text-ink-700">fit@sportshub.example</span>.
        </div>
      </div>
    </div>
  );
}

function SizeTable({ tab, availableSet }) {
  const usColumn = tab === 'women' ? 'usWomen' : 'usMen';
  const usHeader = tab === 'women' ? 'US Women' : 'US Men';
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] table-fixed text-sm">
        <thead>
          <tr className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
            <th className="px-3 py-2 text-left">EU</th>
            <th className="px-3 py-2 text-left">UK</th>
            <th className="px-3 py-2 text-left">{usHeader}</th>
            <th className="px-3 py-2 text-left">Foot length (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_TABLE.map((row) => {
            const isAvailable = availableSet.size === 0 || availableSet.has(row.eu);
            return (
              <tr
                key={row.eu}
                className={classNames(
                  'border-t border-ink-100',
                  isAvailable ? 'text-ink-900' : 'text-ink-300'
                )}
              >
                <td
                  className={classNames(
                    'px-3 py-2',
                    isAvailable ? 'font-bold text-ink-950' : 'font-medium'
                  )}
                >
                  {row.eu}
                </td>
                <td className="px-3 py-2">{row.uk}</td>
                <td className="px-3 py-2">{row[usColumn]}</td>
                <td className="px-3 py-2">{row.cm.toFixed(1)} cm</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MeasureTips() {
  return (
    <div className="space-y-4 text-sm text-ink-600">
      <p>
        Measure both feet at the end of the day, when feet are at their largest, and use the
        longer of the two measurements. Wear the socks you plan to train in for the most
        accurate result.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-ink-700">
        <li>Place a sheet of paper against a wall on a flat floor.</li>
        <li>Stand on the paper with your heel touching the wall.</li>
        <li>Mark the tip of your longest toe on the paper.</li>
        <li>Measure the distance from the wall to the mark in centimetres.</li>
        <li>Find your length in the table to read off your EU / UK / US size.</li>
      </ol>
      <p className="rounded-2xl bg-ink-100/70 p-4 text-ink-700">
        <strong className="font-semibold text-ink-900">Between sizes?</strong> For performance
        boots and runners we recommend sizing up by half. For relaxed lifestyle silhouettes,
        size down for a snug fit.
      </p>
    </div>
  );
}

export default SizeGuideModal;
