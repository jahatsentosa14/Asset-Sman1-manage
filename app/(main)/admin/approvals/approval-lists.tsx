'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoanApprovalCard } from './loan-approval-card';
import { AtkApprovalCard } from './atk-approval-card';

type PendingLoan = Parameters<typeof LoanApprovalCard>[0]['loan'];
type PendingAtkRequest = Parameters<typeof AtkApprovalCard>[0]['request'];

export function LoanApprovalList({ loans }: { loans: PendingLoan[] }) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const visible = loans.filter((l) => !hiddenIds.has(l.id));

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {visible.map((loan) => (
          <LoanApprovalCard
            key={loan.id}
            loan={loan}
            onProcessed={() => setHiddenIds((prev) => new Set(prev).add(loan.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function AtkApprovalList({ requests }: { requests: PendingAtkRequest[] }) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const visible = requests.filter((r) => !hiddenIds.has(r.id));

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {visible.map((request) => (
          <AtkApprovalCard
            key={request.id}
            request={request}
            onProcessed={() => setHiddenIds((prev) => new Set(prev).add(request.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
