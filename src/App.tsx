import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import "./App.css";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useProductContext } from "./context/ContextProvider";
import ProductDialogBox from "./components/ProductDialogBox";
import ProductList from "./components/ProductList";

function App() {
  const { products, setProducts, showDialogBox } = useProductContext();


  const handleDragEnd = (event: any) => {
    const { active, over } = event;
  
    if (!active || !over) return;
  
    const activeId = active.id; // ID of the dragged item
    const overId = over.id; // ID of the target item
  
    const isVariantActive = activeId.toString().length === 14; 
    const isVariantOver = overId.toString().length === 14;
  
    if (isVariantActive && isVariantOver) {
      // Variant-level reordering
      let activeProductIndex = -1;
      let overProductIndex = -1;
  
      products.forEach((product, index) => {
        if (product.variants.some((variant) => variant.id === activeId)) {
          activeProductIndex = index;
        }
        if (product.variants.some((variant) => variant.id === overId)) {
          overProductIndex = index;
        }
      });
  
      if (activeProductIndex !== -1 && activeProductIndex === overProductIndex) {
        // Both variants are in the same product
        const productIndex = activeProductIndex;
        const updatedProducts = [...products];
        const variants = updatedProducts[productIndex].variants;
  
        // Find the indices of the active and over variants
        const activeVariantIndex = variants.findIndex((v) => v.id === activeId);
        const overVariantIndex = variants.findIndex((v) => v.id === overId);
  
        if (activeVariantIndex !== -1 && overVariantIndex !== -1) {
          // Reorder the variants within the product
          updatedProducts[productIndex].variants = arrayMove(
            variants,
            activeVariantIndex,
            overVariantIndex
          );
  
          setProducts(updatedProducts);
        }
      }
    } else if (!isVariantActive && !isVariantOver) {
      // Product-level reordering (as in your original code)
      const activeIndex = products.findIndex((p) => p.id === activeId);
      const overIndex = products.findIndex((p) => p.id === overId);
  
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = arrayMove(products, activeIndex, overIndex);
        if (newOrder !== products) {
          setProducts(newOrder);
        }
        setProducts(newOrder);
      }
    }
  };
  
  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  );

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-gray-100">
      <div className=" max-w-4xl mt-5 w-full mx-auto">
        <h1 className="text-lg font-medium mx-5 sm:mx-0 text-black">Add Products</h1>
      </div>

      <div className="max-w-4xl mt-2 mx-auto w-full flex  rounded-md">
        {/* Product Heading  */}
        <div className="flex-[4] w-full bg-green-20 p-3 mx-5 sm:mx-0">
          <h2 className="font-medium text-md mb-2">Products</h2>
        </div>

        {/* Discount Heading */}
        <div className="flex-[2] w-full bg-blue-20 p-3">
          <h2 className="font-medium text-md mb-2">Discount</h2>
        </div>
      </div>
      {showDialogBox && (
        <div className="absolute inset-0 bg-black opacity-25"></div>
      )}
      {showDialogBox && (
        <div className="absolute inset-0 flex justify-center items-start">
          <ProductDialogBox />
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <ProductList />
      </DndContext>
    </div>
  );
}

export default App;
