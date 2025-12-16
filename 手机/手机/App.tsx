import React, { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = useCallback(() => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene Layer */}
      <Scene treeState={treeState} />
      
      {/* UI Overlay Layer */}
      <UIOverlay treeState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;