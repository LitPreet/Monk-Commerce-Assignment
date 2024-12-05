import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";
import { Product } from "../types";

interface EditProd {
  index: number;
  query: string;
}

interface ProductContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  expandedIndex: number | null;
  setExpandedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  handleToggleVariants: (index: number) => void;
  handleRemoveVariant: (productId: number, variantId: number) => void;
  showDialogBox: boolean;
  handelShowDialogBox: () => void;
  selectedProducts: Product[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  editProd: EditProd;
  setEditProd: React.Dispatch<React.SetStateAction<EditProd>>;
  handleRemoveProduct: (productId: number) => void;
  showDiscountForm:{ [key: number]: boolean };
  setShowDiscountForm: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
  handleSetIndex: (index: number) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showDialogBox, setShowDialogBox] = useState<boolean>(false);
  const [editProd, setEditProd] = useState<EditProd>({
    index: -1,
    query: "",
  });
  // const [showDiscountForm, setShowDiscountForm] = useState<{ [key: number]: boolean }>({});
  const [showDiscountForm, setShowDiscountForm] = useState<{ [key: number]: boolean }>({});
  
  const handelShowDialogBox = useCallback(() => {
    setShowDialogBox((prev) => !prev);
  }, []);


   
  const handleSetIndex = (index:number) => {
    setShowDiscountForm((prev) => ({
      ...prev,
      [index]: true, 
    }));
  };

  // Expands/collapses the variants section for a product
  const handleToggleVariants = useCallback(
    (index: number) => {
      setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
    },
    []
  );

  // Removes a variant from a specific product
  const handleRemoveVariant = useCallback((productId: number, variantId: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.filter((variant) => variant.id !== variantId);
          if (updatedVariants.length === product.variants.length) {
            console.warn(`Variant with ID ${variantId} not found for Product ID ${productId}`);
          }
          return { ...product, variants: updatedVariants };
        }
        return product;
      })
    );
  }, []);

  // Removes a product
  const handleRemoveProduct = useCallback((productId: number) => {
    setProducts((prevProd) => {
      const updatedProducts = prevProd.filter((product) => product.id !== productId);
      if (updatedProducts.length === prevProd.length) {
        console.warn(`Product with ID ${productId} not found or not removed`);
      }
      return updatedProducts;
    });
  }, []);

  const value = useMemo(
    () => ({
      products,
      setProducts,
      expandedIndex,
      setExpandedIndex,
      handleToggleVariants,
      handleRemoveVariant,
      showDialogBox,
      handelShowDialogBox,
      selectedProducts,
      setSelectedProducts,
      editProd,
      setEditProd,
      handleRemoveProduct,
      showDiscountForm,
      setShowDiscountForm,
      handleSetIndex
      
    }),
    [
      products,
      expandedIndex,
      showDialogBox,
      selectedProducts,
      editProd,
      handleToggleVariants,
      handelShowDialogBox,
      handleRemoveVariant,
      handleRemoveProduct,
      handleSetIndex
    ]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// Custom hook to consume the ProductContext
export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
