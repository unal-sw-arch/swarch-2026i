import { RouterProvider } from 'react-router';
import { router } from './routes';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={router} />
      <Toaster />
    </DndProvider>
  );
}

export default App;
