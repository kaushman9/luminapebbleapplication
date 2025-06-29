import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { User, Asset, AssetTypeConfig } from '../../types';
import { produce } from 'immer';

interface UserAssignmentsProps {
  assignments: User['assignments'];
  assets: Asset[];
  assetTypeConfigs: AssetTypeConfig[];
  onAssignmentsChange: (assignments: User['assignments']) => void;
}

export const UserAssignments: React.FC<UserAssignmentsProps> = ({ assignments, assets, assetTypeConfigs, onAssignmentsChange }) => {
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedAssetForNewAssignment, setSelectedAssetForNewAssignment] = useState<string>(assets[0]?.id || '');
  const [selectedPositionForNewAssignment, setSelectedPositionForNewAssignment] = useState<string>('');

  const availablePositionsForAsset = useMemo(() => {
    const asset = assets.find(a => a.id === selectedAssetForNewAssignment);
    if (!asset) return [];
    const config = assetTypeConfigs.find(c => c.id === asset.assetTypeId);
    return config ? config.positions : [];
  }, [selectedAssetForNewAssignment, assets, assetTypeConfigs]);

  useEffect(() => {
    setSelectedPositionForNewAssignment(availablePositionsForAsset[0]?.id || '');
  }, [availablePositionsForAsset]);
  
  const handleRemoveAssignment = (assignmentId: string) => {
    onAssignmentsChange(assignments.filter(a => a.id !== assignmentId));
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === selectedAssetForNewAssignment);
    const position = availablePositionsForAsset.find(p => p.id === selectedPositionForNewAssignment);
    if (!asset || !position) return;

    if (assignments.some(a => a.assetId === asset.id && a.positionId === position.id)) {
      alert('This user already has that position at this asset.');
      return;
    }

    const newAssignmentEntry = {
      id: `assign-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      positionId: position.id,
      positionTitle: position.title,
    };
    
    onAssignmentsChange([...assignments, newAssignmentEntry]);
    setShowAddAssignment(false);
  };
  
  return (
    <Card title="Assignments" action={
      <button onClick={() => setShowAddAssignment(!showAddAssignment)} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
        <Icon name="plus" className="h-4 w-4 mr-1"/>
        Add Assignment
      </button>
    }>
      <div className="space-y-4">
        {showAddAssignment && (
          <form onSubmit={handleAddAssignment} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">New Assignment</h4>
            <div>
              <label htmlFor="asset" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asset</label>
              <select id="asset" value={selectedAssetForNewAssignment} onChange={e => setSelectedAssetForNewAssignment(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
              <select id="position" value={selectedPositionForNewAssignment} onChange={e => setSelectedPositionForNewAssignment(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md" disabled={availablePositionsForAsset.length === 0}>
                {availablePositionsForAsset.length > 0 ? (
                  availablePositionsForAsset.map(pos => <option key={pos.id} value={pos.id}>{pos.title}</option>)
                ) : (
                  <option>No positions available for this asset type</option>
                )}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddAssignment(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md" disabled={!selectedPositionForNewAssignment}>Add</button>
            </div>
          </form>
        )}
        <ul className="divide-y divide-slate-200/80 dark:divide-slate-800">
          {assignments.length === 0 && <p className="text-sm text-center py-4 text-slate-500 dark:text-slate-400">No assignments yet.</p>}
          {assignments.map(assignment => (
            <li key={assignment.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{assignment.assetName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.positionTitle}</p>
              </div>
              <button onClick={() => handleRemoveAssignment(assignment.id)} className="p-2 text-slate-500 hover:text-danger-600 hover:bg-danger-100 dark:hover:bg-danger-500/20 rounded-full" title="Remove Assignment">
                <Icon name="trash" className="h-5 w-5"/>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};