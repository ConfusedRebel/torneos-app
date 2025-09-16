import React, { createContext, useContext } from 'react';
import type { TorneosRepo } from './torneosRepo';
import { mockTorneosRepo } from './adapters/mockTorneosRepo';

const TorneosCtx = createContext<TorneosRepo>(mockTorneosRepo);

export function TorneosProvider({ repo = mockTorneosRepo, children }:{
  repo?: TorneosRepo; children: React.ReactNode;
}) {
  return <TorneosCtx.Provider value={repo}>{children}</TorneosCtx.Provider>;
}

export const useTorneosRepo = () => useContext(TorneosCtx);
