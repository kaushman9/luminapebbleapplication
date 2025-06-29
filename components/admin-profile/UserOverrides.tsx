import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { User, Asset, AssetTypeConfig, UserPermissionOverride } from '../../types';
import { Modal } from '../ui/Modal';

interface UserOverridesProps {
  user: User | Omit<User, 'id'>;
  assets: Asset[];
  assetTypeConfigs: AssetTypeConfig[];
  onOverridesChange: (overrides: User['overrides']) => void;
}

export const UserOverrides: React.FC<UserOverridesProps> = ({ user, assets, assetTypeConfigs, onOverridesChange }) => {
  const [editingOverridesForAssetId, setEditingOverridesForAssetId] = useState<string | null>(null);

  const handleOverrideChange = (assetId: string, permissionId: string, value: boolean | null) => {
    const otherOverrides = (user.overrides || []).filter(
      o => !(o.assetId === assetId && o.permissionId === permissionId)
    );
    if (value === null) {
      onOverridesChange(otherOverrides);
      return;
    }
    const newOverride: UserPermissionOverride = { assetId, permissionId, hasPermission: value };
    onOverridesChange([...otherOverrides, newOverride]);
  };

  const configForOverrideModal = assetTypeConfigs.find(c => c.id === assets.find(a => a.id === editingOverridesForAssetId)?.assetTypeId);
  
  return (
    <>
      <Card title="Permission Overrides" action={
        <span className="text-xs text-slate-500">Explicitly grant or revoke permissions.</span>
      }>
        <ul className="divide-y divide-slate-200/80 dark:divide-slate-800">
          {user.assignments.length === 0 && <p className="text-sm text-center py-4 text-slate-500 dark:text-slate-400">Assign user to an asset to manage overrides.</p>}
          {user.assignments.map(assignment => (
            <li key={assignment.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{assignment.assetName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Role: {assignment.positionTitle}</p>
              </div>
              <button onClick={() => setEditingOverridesForAssetId(assignment.assetId)} className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                <Icon name="pencil-square" className="h-4 w-4 mr-1"/>
                Manage Overrides
              </button>
            </li>
          ))}
        </ul>
      </Card>
      
      {editingOverridesForAssetId && configForOverrideModal && (
        <OverrideModal
          config={configForOverrideModal}
          user={user}
          assetId={editingOverridesForAssetId}
          onClose={() => setEditingOverridesForAssetId(null)}
          onOverrideChange={handleOverrideChange}
        />
      )}
    </>
  );
};


const OverrideModal: React.FC<{
  config: AssetTypeConfig,
  user: User | Omit<User, 'id'>,
  assetId: string,
  onClose: () => void,
  onOverrideChange: (assetId: string, permissionId: string, value: boolean | null) => void
}> = ({ config, user, assetId, onClose, onOverrideChange }) => {
    const assignment = user.assignments.find(a => a.assetId === assetId);
    if (!assignment) return null;

    return (
      <Modal show={true} onClose={onClose} title={`Edit Overrides for ${assignment.assetName}`} size="3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200"></h3>
            <p className="text-sm text-slate-500">Role: {assignment.positionTitle}</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {config.pages.map(page => (
                <div key={page.id} className="overflow-x-auto">
                  <h4 className="font-semibold text-md text-slate-800 dark:text-slate-200 border-b pb-1 mb-2">{page.name}</h4>
                  <table className="min-w-full">
                    <tbody>
                      {page.permissions.map(perm => {
                        const positionPermission = config.permissionMatrix[assignment.positionId]?.[perm.id] ?? false;
                        const override = (user.overrides || []).find(o => o.assetId === assetId && o.permissionId === perm.id);
                        
                        return (
                          <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2 pr-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{perm.description}</td>
                            <td className="py-2 text-center whitespace-nowrap">
                              {positionPermission
                                ? <span title="Granted by position"><Icon name="check-circle" className="h-5 w-5 text-success-500 inline-block"/></span>
                                : <span title="Denied by position"><Icon name="x-circle" className="h-5 w-5 text-danger-500 inline-block"/></span>
                              }
                            </td>
                            <td className="py-2 pl-4 whitespace-nowrap">
                              <fieldset className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="radio" name={`${perm.id}-override`} checked={override === undefined} onChange={() => onOverrideChange(assetId, perm.id, null)} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500" /><span>Inherit</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="radio" name={`${perm.id}-override`} checked={override?.hasPermission === true} onChange={() => onOverrideChange(assetId, perm.id, true)} className="h-4 w-4 text-success-600 border-slate-300 focus:ring-success-500" /><span className="text-success-600 dark:text-success-400">Grant</span></label>
                                <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="radio" name={`${perm.id}-override`} checked={override?.hasPermission === false} onChange={() => onOverrideChange(assetId, perm.id, false)} className="h-4 w-4 text-danger-600 border-slate-300 focus:ring-danger-500" /><span className="text-danger-600 dark:text-danger-400">Deny</span></label>
                              </fieldset>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Close</button>
          </div>
      </Modal>
    )
}