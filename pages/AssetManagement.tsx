import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Asset, AssetType, SortConfig, Address } from '../types';
import { Icon } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';

interface AssetManagementProps {
  assets: Asset[];
  assetTypes: AssetType[];
  onCreateAsset: (newAsset: Omit<Asset, 'id' | 'status'>) => void;
  onUpdateAsset: (updatedAsset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetManagement: React.FC<AssetManagementProps> = (props) => {
    const { assets, assetTypes } = props;
    
    // State for modals
    const [showNewAssetModal, setShowNewAssetModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
    
    // State for filtering and sorting the assets table
    const [filter, setFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const getAssetTypeName = (typeId: string) => assetTypes.find(t => t.id === typeId)?.name || 'N/A';
    
    // --- Memoized Asset Filtering & Sorting ---
    const sortedAssets = useMemo(() => {
        let sortableAssets = [...assets];
        if (sortConfig !== null) {
            const getNestedValue = (obj: any, path: string): any => {
              return path.split('.').reduce((o, p) => (o && o[p] != null) ? o[p] : null, obj);
            }
            sortableAssets.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableAssets;
    }, [assets, sortConfig]);

    const filteredAndSortedAssets = useMemo(() => {
        const lowercasedFilter = filter.toLowerCase();
        return sortedAssets.filter(asset =>
            asset.name.toLowerCase().includes(lowercasedFilter) ||
            getAssetTypeName(asset.assetTypeId).toLowerCase().includes(lowercasedFilter) ||
            asset.status.toLowerCase().includes(lowercasedFilter) ||
            asset.location.street.toLowerCase().includes(lowercasedFilter) ||
            asset.location.city.toLowerCase().includes(lowercasedFilter) ||
            asset.location.state.toLowerCase().includes(lowercasedFilter) ||
            asset.location.zip.toLowerCase().includes(lowercasedFilter) ||
            asset.location.country.toLowerCase().includes(lowercasedFilter)
        );
    }, [sortedAssets, filter]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <Icon name="arrow-up" className="h-4 w-4" /> : <Icon name="arrow-down" className="h-4 w-4" />;
    };
    
    const tableHeaders: { key: string, label: string }[] = [
      { key: 'name', label: 'Asset Name' },
      { key: 'assetTypeId', label: 'Type' },
      { key: 'location.street', label: 'Street' },
      { key: 'location.city', label: 'City' },
      { key: 'location.state', label: 'State' },
      { key: 'location.zip', label: 'ZIP' },
      { key: 'location.country', label: 'Country' },
      { key: 'status', label: 'Status' },
    ];
    
    // --- Handlers for various CRUD modals ---
    
    const handleSaveAsset = (asset: Asset | Omit<Asset, 'id'|'status'>) => {
      if ('id' in asset) {
        props.onUpdateAsset(asset as Asset);
      } else {
        props.onCreateAsset(asset);
      }
      setEditingAsset(null);
      setShowNewAssetModal(false);
    }
    
    const handleDeleteAsset = () => {
      if (deletingAssetId) {
        props.onDeleteAsset(deletingAssetId);
        setDeletingAssetId(null);
      }
    }

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Asset Management
          </h1>
        </div>
        <div className="mt-4 sm:mt-0">
            <button
                onClick={() => setShowNewAssetModal(true)}
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Asset
            </button>
        </div>
      </div>
      <Card 
        title={
          <div className="relative max-w-xs flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="funnel" className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder="Filter assets..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        }
        bodyClassName="overflow-x-auto"
      >
        <div className="min-w-full align-middle">
          <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    {tableHeaders.map(col => (
                      <th key={col.key} scope="col" className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                         <button onClick={() => requestSort(col.key)} className="flex items-center space-x-1 group">
                           <span>{col.label}</span>
                           <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                            {getSortIndicator(col.key)}
                           </span>
                         </button>
                      </th>
                    ))}
                    <th scope="col" className="relative p-3"><span className="sr-only">Actions</span></th>
                  </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900">
                  {filteredAndSortedAssets.length > 0 ? (
                    filteredAndSortedAssets.map(asset => (
                      <tr key={asset.id} className="border-b border-slate-200/80 dark:border-slate-800/50 last:border-b-0 hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">{asset.name}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{getAssetTypeName(asset.assetTypeId)}</td>
                          <td className="p-3 text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs" title={asset.location.street}>{asset.location.street}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{asset.location.city}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{asset.location.state}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{asset.location.zip}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{asset.location.country}</td>
                          <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{asset.status}</td>
                          <td className="p-3 whitespace-nowrap text-right space-x-1">
                              <button onClick={() => setEditingAsset(asset)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-primary-400 rounded" title={`Edit ${asset.name}`}><Icon name="pencil-square" className="h-4 w-4"/></button>
                              <button onClick={() => setDeletingAssetId(asset.id)} className="p-1.5 text-slate-500 hover:text-danger-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-danger-400 rounded" title={`Delete ${asset.name}`}><Icon name="trash" className="h-4 w-4"/></button>
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableHeaders.length + 1} className="text-center py-16 text-slate-500">
                        <div className="flex flex-col items-center">
                            <Icon name="building-office" className="h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-lg font-semibold">No assets found</h3>
                            <p className="mt-1 text-sm text-slate-500">No assets matched your filter criteria.</p>
                             <button
                                onClick={() => setShowNewAssetModal(true)}
                                className="mt-4 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm w-full sm:w-auto">
                                <Icon name="plus" className="h-4 w-4 mr-2" />
                                New Asset
                            </button>
                         </div>
                      </td>
                    </tr>
                  )}
              </tbody>
          </table>
        </div>
      </Card>
      
      {/* --- Modals for CRUD operations --- */}

      {(showNewAssetModal || editingAsset) && 
        <AssetFormModal 
          isEditing={!!editingAsset}
          asset={editingAsset}
          assetTypes={assetTypes} 
          onSave={handleSaveAsset} 
          onClose={() => {setShowNewAssetModal(false); setEditingAsset(null);}} 
        />
      }
      
      <Modal show={!!deletingAssetId} onClose={() => setDeletingAssetId(null)} title="Delete Asset">
          <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this asset? This will also remove all user assignments to it. This action cannot be undone.</p>
          <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setDeletingAssetId(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
              <button onClick={handleDeleteAsset} className="px-4 py-2 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 rounded-md">Delete Asset</button>
          </div>
      </Modal>

    </div>
  );
};


const AssetFormModal: React.FC<{
  isEditing: boolean;
  asset: Asset | null;
  assetTypes: AssetType[];
  onSave: (asset: Asset | Omit<Asset, 'id' | 'status'>) => void;
  onClose: () => void;
}> = ({isEditing, asset, assetTypes, onSave, onClose}) => {
  
  const [currentAsset, setCurrentAsset] = useState(() => {
    const initialState = {
      name: '',
      location: { street: '', city: '', state: '', zip: '', country: '' },
      assetTypeId: assetTypes[0]?.id || '',
      status: 'Active' as const
    };
    return isEditing && asset ? asset : initialState;
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAsset(prev => ({...prev, [name]: value}));
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAsset(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isEditing && asset) {
        onSave({...currentAsset, id: asset.id});
    } else {
        onSave(currentAsset);
    }
  }

  return (
    <Modal show={true} onClose={onClose} title={isEditing ? `Edit Asset: ${asset?.name}` : "Add New Asset"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asset Name</label>
          <input type="text" name="name" id="name" value={currentAsset.name} onChange={handleChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
        </div>
        
        {/* New Structured Address Fields */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Street Address</label>
          <input type="text" name="street" id="street" value={currentAsset.location.street} onChange={handleLocationChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
              <input type="text" name="city" id="city" value={currentAsset.location.city} onChange={handleLocationChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">State / Province</label>
              <input type="text" name="state" id="state" value={currentAsset.location.state} onChange={handleLocationChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-slate-700 dark:text-slate-300">ZIP / Postal Code</label>
              <input type="text" name="zip" id="zip" value={currentAsset.location.zip} onChange={handleLocationChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
            </div>
        </div>
         <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
          <input type="text" name="country" id="country" value={currentAsset.location.country} onChange={handleLocationChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md"/>
        </div>

        <div>
          <label htmlFor="assetTypeId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asset Type</label>
          <select name="assetTypeId" id="assetTypeId" value={currentAsset.assetTypeId} onChange={handleChange} required className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            {assetTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        {isEditing && (
           <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select name="status" id="status" value={currentAsset.status} onChange={handleChange} className="mt-1 block w-full text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
              <option value="Active">Active</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md">{isEditing ? 'Save Changes' : 'Create Asset'}</button>
        </div>
      </form>
    </Modal>
  )
}