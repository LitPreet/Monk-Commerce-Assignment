import { SortableContext } from "@dnd-kit/sortable";
import { useProductContext } from "../context/ContextProvider";
import SortableItem from "./ListItem";

const ProductList = () => {
  const { products,  handelShowDialogBox } =
    useProductContext();
   
  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col  min-h-screen rounded-md">
      <SortableContext items={products.map((product) => product.id)}>
        {products && products.length > 0 && products.map((product, index) => (
        <SortableItem key={product.id} product={product} index={index} />
      ))}
        <div className="w-full px-2 sm:px-0 sm:w-[80%] flex justify-end">
          <button
            className=" border-2 w-[150px] sm:w-[193px] border-[#008060] p-2 rounded text-[#008060]"
            onClick={handelShowDialogBox}
          >
            Add Product
          </button>
        </div>
      </SortableContext>
    </div>
  );
};

export default ProductList;

