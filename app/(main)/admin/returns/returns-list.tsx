'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ReturnReviewForm } from './return-review-form';

type LoanForReturn = Parameters<typeof ReturnReviewForm>[0]['loan'];

export function ReturnsList({ loans }: { loans: LoanForReturn[] }) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const visible = loans.filter((l) => !hiddenIds.has(l.id));

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {visible.map((loan) => (
          <ReturnReviewForm
            key={loan.id}
            loan={loan}
            onProcessed={() => setHiddenIds((prev) => new Set(prev).add(loan.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
