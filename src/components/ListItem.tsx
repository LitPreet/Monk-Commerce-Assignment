import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIcon from "../assets/images/drag.png";
import { CSSProperties, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, X } from "lucide-react";
import {  Product } from "../types";
import { useProductContext } from "../context/ContextProvider";

const VariantItem = ({
  variant,
}: {
  variant: { id: number; title: string; price: number };
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: variant.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex items-center ml-7 bg-white p-2 sm:p-3 rounded-3xl mb-1  w-[80%] sm:w-[90%]"
    >
      <img src={DragIcon} alt="drag icon" className="w-4 h-4 mr-2" />
      <p className="text-[9px] sm:text-xs font-medium">{variant.title}</p>
      <p className="ml-auto text-[9px] sm:text-xs text-gray-600">${variant.price}</p>
    </div>
  );
};

const SortableItem = ({
  product,
  index,
}: {
  product: Product;
  index: number;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: product.id,
    });
  const [discount, setDiscount] = useState({
    amount: product.discount?.amount || "",
    type: product.discount?.type || "percentage",
  });

  const [variantDiscounts, setVariantDiscounts] = useState(() => {
    const initialDiscounts: {
      [variantId: string]: { amount: string; type: "percentage" | "flat" };
    } = {};
    product.variants.forEach((variant) => {
      initialDiscounts[variant.id] = {
        amount: variant.discount?.amount || "",
        type: variant.discount?.type || "percentage",
      };
    });
    return initialDiscounts;
  });

  const {
    expandedIndex,
    handleToggleVariants,
    setSelectedProducts,
    handelShowDialogBox,
    setEditProd,
    handleRemoveProduct,
    handleRemoveVariant,
    handleSetIndex,
    showDiscountForm,
    setProducts,
  } = useProductContext();

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSetSelectedProductForEdit = (product: Product, index: number) => {
    setSelectedProducts([product]);
    setEditProd({ index, query: product.title });
    handelShowDialogBox();
  };

  const handleEditClick = () => handleSetSelectedProductForEdit(product, index);

  
const handleDiscountChange = (value: string, type: "amount" | "type") => {
    setDiscount((prevDiscount) => {
      const updatedDiscount = { 
        ...prevDiscount,
        [type]: value
      };
    
      setProducts((prevProducts) =>
        prevProducts.map((prod) => 
          prod.id === product.id
            ? {
                ...prod,
                discount: updatedDiscount,
                variants: prod.variants.map((variant) => ({
                  ...variant,
                  discount: updatedDiscount,
                }))
              }
            : prod
        )
      );
  
      // Update variant discounts state
      setVariantDiscounts((prevVariantDiscounts) => {
        const updatedVariantDiscounts = { ...prevVariantDiscounts };
        
        product.variants.forEach((variant) => {
          updatedVariantDiscounts[variant.id] = updatedDiscount;
        });
  
        return updatedVariantDiscounts;
      });
  
      return updatedDiscount;
    });
  };
  
  const handleVariantDiscountChange = (
    variantId: number,
    value: string,
    type: "amount" | "type"
  ) => {
    setVariantDiscounts((prevDiscounts) => {
      
      const updatedDiscounts = { ...prevDiscounts };
      
      // Get the current variant discount or create a new one
      const currentVariantDiscount = updatedDiscounts[variantId] || { 
        amount: "", 
        type: "percentage" as const 
      };
  
      // Update the specific field
      const updatedVariantDiscount = {
        ...currentVariantDiscount,
        [type]: value
      };
  
      // Update the specific variant's discount
      updatedDiscounts[variantId] = updatedVariantDiscount;
  
      return updatedDiscounts;
    });
  
    // Update the products state
    setProducts((prevProducts) =>
      prevProducts.map((prod) => ({
        ...prod,
        variants: prod.variants.map((variant) => 
          variant.id === variantId
            ? { 
                ...variant, 
                discount: {
                  amount: type === 'amount' ? value : variant.discount?.amount || '',
                  type: type === 'type' 
                    ? value as 'percentage' | 'flat' 
                    : variant.discount?.type || 'percentage'
                }
              }
            : variant
        )
      }))
    );
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex flex-col w-full p-2 mb-2 rounded-md"
    >
      <div className="flex w-full">
        <div className="flex-[4] flex items-center gap-4 px-1 py-3 sm:p-3 rounded-md">
          <div className="flex items-center">
            <img
              src={DragIcon}
              alt="drag icon"
              className="w-4 h-4 sm:w-6 sm:h-6 sm:mr-2"
            />
            <span className="ml-2 text-sm font-medium">{index + 1}</span>
          </div>
          <div className="flex justify-between bg-white p-2 sm:p-3 rounded-md items-center w-full">
            <div className="flex items-center gap-4">
              <p className="sm:text-sm text-[12px] sm:hidden font-medium">{product.title.slice(0,14)+'...'}</p>
              <p className="sm:text-sm text-[12px] hidden sm:block font-medium">{product.title}</p>
            </div>
            <div className="flex items-center justify-center">
              <button onClick={handleEditClick}>
                <Pencil size={15} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex-[2]  flex justify-start items-center rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          {showDiscountForm[index] ? (
            <div className="flex gap-2 w-[150px] sm:w-1/2">
              <input
                type="text"
                value={discount.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isNaN(+value)) return;
                  handleDiscountChange(value, "amount");
                }}
                className="outline-none px-2 sm:py-4 py-3 w-1/2 text-[9px] sm:text-md text-center rounded"
              />
              <select
                className="w-1/2 rounded text-[9px] sm:text-sm outline-none"
                value={discount.type}
                onChange={(e) => handleDiscountChange(e.target.value, "type")}
              >
                <option value="% off">% off</option>
                <option value="flat off">flat off</option>
              </select>
            </div>
          ) : (
            <button
              className="px-2  sm:px-4  sm:py-2 text-[9px] py-3 sm:text-sm bg-[#008060] text-white rounded"
              onClick={() => {
                handleSetIndex(index);
              }}
            >
              Add Discount
            </button>
          )}

          <button
            className="ml-0 sm:ml-4 px-2 py-1 text-xs text-gray-500 rounded"
            onClick={() => handleRemoveProduct(product.id)}
          >
            <X />
          </button>
        </div>
      </div>

      {product.variants.length > 1 && (
        <div className="flex justify-end  items-center mt-2 w-[95%] sm:w-[80%] gap-2">
          <button
            onClick={() => handleToggleVariants(index)}
            className="text-sm text-blue-600 flex items-center gap-[2px]"
          >
            {expandedIndex === index ? (
              <>
                <span className="underline decoration-blue-600">
                  Hide variants
                </span>
                <ChevronUp />
              </>
            ) : (
              <>
                <span className="underline decoration-blue-600">
                  Show variants
                </span>
                <ChevronDown />
              </>
            )}
          </button>
        </div>
      )}

      {product.variants && product.variants.length > 1 ? (
        expandedIndex === index && (
          <div className=" sm:pl-8  mt-2 w-[90%] sm:w-[80%] flex items-end flex-col">
            <SortableContext
              items={product.variants.map((variant) => variant.id)}
            >
              {product.variants.map((variant, i) => (
                <div
                  className="flex gap-2  items-center w-[80%]"
                  key={variant.id}
                >
                  <VariantItem variant={variant} />
                  {showDiscountForm[index] && (
                    <div className="flex gap-2 w-[180px]  justify-end sm:w-1/2">
                      <input
                        type="text"
                        value={
                          variantDiscounts[product.variants[i].id]?.amount || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isNaN(+value)) return;
                          handleVariantDiscountChange(
                            product.variants[i].id,
                            (e.target.value),
                            "amount"
                          );
                        }}
                       className="outline-none p-2 w-1/2 text-center rounded text-[9px] sm:text-base"
                        placeholder="Amount"
                      />
                      <select
                        value={
                          variantDiscounts[product.variants[i].id]?.type || ""
                        }
                        onChange={(e) =>
                          handleVariantDiscountChange(
                            product.variants[i].id,
                            e.target.value,
                            "type"
                          )
                        }
                         className="w-1/2 sm:text-sm rounded outline-none text-[9px]"
                      >
                        <option value="% off">% off</option>
                        <option value="flat off">flat off</option>
                      </select>
                    </div>
                  )}

                  <button
                     className=" ml-0 sm:ml-4 px-1 py-1 text-xs  text-gray-500 rounded"
                    onClick={() => handleRemoveVariant(product.id, variant.id)}
                  >
                    <X />
                  </button>
                </div>
              ))}
            </SortableContext>
          </div>
        )
      ) : product.variants && product.variants.length === 1 ? (
        <div className="pl-10 sm:pl-8  mt-2 w-[100%] sm:w-[80%] flex items-end flex-col">
          <div className="flex  gap-2 items-center w-[100%] sm:w-[80%]">
            <VariantItem variant={product.variants[0]} />
            {showDiscountForm[index] && (
              <div className="flex gap-2 w-[180px]  justify-end sm:w-1/2">
                <input
                  type="text"
                  value={variantDiscounts[product.variants[0].id]?.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isNaN(+value)) return;
                    handleVariantDiscountChange(
                      product.variants[0].id,
                      (e.target.value),
                      "amount"
                    );
                  }}
                  className="outline-none p-2 w-1/2 text-center rounded text-[9px] sm:text-base"
                  placeholder=""
                />
                <select
                  value={
                    variantDiscounts[product.variants[0].id]?.type ||
                    "percentage"
                  }
                  onChange={(e) =>
                    handleVariantDiscountChange(
                      product.variants[0].id,
                      e.target.value,
                      "type"
                    )
                  }
                  className="w-1/2 sm:text-sm rounded outline-none text-[9px]"
                >
                  <option value="% off">% off</option>
                  <option value="flat off">flat off</option>
                </select>
              </div>
            )}
            <button
              className=" ml-0 sm:ml-4 px-1 py-1 text-xs  text-gray-500 rounded"
              onClick={() =>
                handleRemoveVariant(product.id, product.variants[0].id)
              }
            >
              <X />
            </button>
          </div>
        </div>
      ) : (
        <div className="pl-8 mt-2 w-[80%] flex items-end flex-col">
          <p className="text-sm text-gray-500"></p>
        </div>
      )}
    </div>
  );
};

export default SortableItem;
