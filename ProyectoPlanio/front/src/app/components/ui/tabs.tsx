import * as React from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';

interface TabsContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps extends React.ComponentProps<'div'> {
  value: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ className, value, onValueChange, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }: React.ComponentProps<'div'>) {
  const ctx = React.useContext(TabsContext);

  if (!ctx) {
    return null;
  }

  return (
    <MuiTabs
      value={ctx.value}
      onChange={(_, newValue) => ctx.onValueChange?.(newValue)}
      className={className}
      variant="scrollable"
      scrollButtons="auto"
      {...props}
    >
      {children}
    </MuiTabs>
  );
}

interface TabsTriggerProps extends React.ComponentProps<'button'> {
  value: string;
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  return <MuiTab className={className} value={value} label={children} {...props} />;
}

interface TabsContentProps extends React.ComponentProps<'div'> {
  value: string;
}

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);

  if (!ctx || ctx.value !== value) {
    return null;
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
