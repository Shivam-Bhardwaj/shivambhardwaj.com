'use client';

import { useState, useEffect } from 'react';
import { componentRegistry } from '../../lib/components/registry';
import { ComponentConfig, ComponentPlaygroundProps } from '../../lib/components/types';
import DynamicZone from './DynamicZone';

interface PropEditor {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export default function ComponentPlayground({
  componentId,
  initialProps = {},
  showCode = true,
  showPreview = true,
}: ComponentPlaygroundProps) {
  const [config, setConfig] = useState<ComponentConfig | null>(null);
  const [props, setProps] = useState(initialProps);
  const [propEditors, setPropEditors] = useState<PropEditor[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'props' | 'code'>('preview');

  useEffect(() => {
    const componentConfig = componentRegistry.getConfig(componentId);
    setConfig(componentConfig);
    
    if (componentConfig?.props) {
      const editors: PropEditor[] = Object.entries(componentConfig.props).map(([key, value]) => ({
        key,
        value,
        type: inferType(value),
      }));
      setPropEditors(editors);
    }
  }, [componentId]);

  const inferType = (value: any): PropEditor['type'] => {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'object';
  };

  const updateProp = (key: string, value: any) => {
    setProps(prev => ({ ...prev, [key]: value }));
  };

  const addProp = () => {
    const newKey = `prop${propEditors.length + 1}`;
    setPropEditors(prev => [...prev, { key: newKey, value: '', type: 'string' }]);
  };

  const removeProp = (index: number) => {
    const editor = propEditors[index];
    setPropEditors(prev => prev.filter((_, i) => i !== index));
    setProps(prev => {
      const newProps = { ...prev };
      delete newProps[editor.key];
      return newProps;
    });
  };

  const updatePropEditor = (index: number, field: keyof PropEditor, value: any) => {
    setPropEditors(prev => {
      const newEditors = [...prev];
      const oldKey = newEditors[index].key;
      newEditors[index] = { ...newEditors[index], [field]: value };
      
      if (field === 'key' && value !== oldKey) {
        setProps(prevProps => {
          const newProps = { ...prevProps };
          if (oldKey in newProps) {
            newProps[value] = newProps[oldKey];
            delete newProps[oldKey];
          }
          return newProps;
        });
      } else if (field === 'value') {
        updateProp(newEditors[index].key, value);
      }
      
      return newEditors;
    });
  };

  const renderPropEditor = (editor: PropEditor, index: number) => {
    const { key, value, type } = editor;

    return (
      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={key}
            onChange={(e) => updatePropEditor(index, 'key', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border rounded"
            placeholder="Property name"
          />
          <select
            value={type}
            onChange={(e) => updatePropEditor(index, 'type', e.target.value as PropEditor['type'])}
            className="px-2 py-1 text-xs border rounded"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
          </select>
          <button
            onClick={() => removeProp(index)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
        
        <div>
          {type === 'string' && (
            <input
              type="text"
              value={value}
              onChange={(e) => updatePropEditor(index, 'value', e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="String value"
            />
          )}
          
          {type === 'number' && (
            <input
              type="number"
              value={value}
              onChange={(e) => updatePropEditor(index, 'value', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="Number value"
            />
          )}
          
          {type === 'boolean' && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => updatePropEditor(index, 'value', e.target.checked)}
              />
              {String(value)}
            </label>
          )}
          
          {type === 'object' && (
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updatePropEditor(index, 'value', parsed);
                } catch {
                  updatePropEditor(index, 'value', e.target.value);
                }
              }}
              className="w-full px-2 py-1 text-xs border rounded font-mono"
              rows={3}
              placeholder="JSON object"
            />
          )}
        </div>
      </div>
    );
  };

  if (!config) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Component "{componentId}" not found</p>
      </div>
    );
  }

  return (
    <div className="component-playground bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="border-b dark:border-gray-700">
        <div className="px-4 py-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{config.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
        </div>
        
        <div className="flex border-t dark:border-gray-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('props')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'props'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Props
          </button>
          {showCode && (
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              Code
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'preview' && showPreview && (
          <div className="border rounded-lg p-4 min-h-32">
            <DynamicZone
              componentId={componentId}
              props={props}
              fallback={<div className="text-gray-500">Component not available</div>}
            />
          </div>
        )}

        {activeTab === 'props' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Properties</h4>
              <button
                onClick={addProp}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Prop
              </button>
            </div>
            
            <div className="space-y-3">
              {propEditors.map(renderPropEditor)}
            </div>
            
            {propEditors.length === 0 && (
              <p className="text-gray-500 text-center py-8">No properties configured</p>
            )}
          </div>
        )}

        {activeTab === 'code' && showCode && (
          <div className="space-y-4">
            <h4 className="font-medium">Component Usage</h4>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-xs overflow-x-auto">
              <code>
                {`<DynamicZone
  componentId="${componentId}"
  props={${JSON.stringify(props, null, 2)}}
/>`}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}