// components/ui/tabs.jsx
import * as React from 'react';

const TabsContext = React.createContext({});

const Tabs = ({ value, defaultValue, onValueChange, className = "", children }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = React.useCallback((newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  }, [onValueChange, value]);

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className = "", value, children, ...props }, ref) => {
  const { value: activeTab, onValueChange } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none 
        disabled:opacity-50 
        ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className = "", value, children, ...props }, ref) => {
  const { value: activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };