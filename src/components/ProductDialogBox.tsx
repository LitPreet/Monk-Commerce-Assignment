import { Search, X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useProductContext } from "../context/ContextProvider";
import { Product } from "../types";
import { debounce, fetchProducts } from "../utils";
import Loader from "./Loader";
import { useQuery } from "@tanstack/react-query";


const ProductDialogBox: React.FC = () => {
  const {
    handelShowDialogBox,
    setProducts,
    selectedProducts,
    setSelectedProducts,
    editProd,
    setEditProd,
  } = useProductContext();

  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page,setPage] = useState<number>(1);


  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPage(1); // Reset to page 1 on new search
    }, 500),
    []
  );
 
  const { data, isLoading } = useQuery({
    queryKey: ["products", searchQuery, page], 
    queryFn: () => fetchProducts(searchQuery, page),
    staleTime: 0, 
  });
  
  useEffect(() => {
    if (data) {
      setApiProducts(data);
    }
  }, [data]);
  
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      debouncedSetSearchQuery(value);
    },
    [debouncedSetSearchQuery]
  );

  const handleProductToggle = useCallback(
    (productId: number, product: Product) => {
      setSelectedProducts((prev) => {
        const isProductSelected = prev.some((p) => p.id === productId);

        if (editProd.query.length > 1) {
          return isProductSelected ? [] : [product];
        }
        return isProductSelected
          ? prev.filter((p) => p.id !== productId)
          : [...prev, product];
      });
    },
    [editProd, setSelectedProducts]
  );

  const handleVariantToggle = useCallback(
    (productId: number, newVariant: Product["variants"][0]) => {
      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                variants: product.variants.some((v) => v.id === newVariant.id)
                  ? product.variants.filter((v) => v.id !== newVariant.id)
                  : [...product.variants, newVariant],
              }
            : product
        )
      );
    },
    [setSelectedProducts]
  );

  const handleAddToMainProducts = useCallback(() => {
    setProducts((prev) => {
      const updatedProducts = [...prev];
      selectedProducts.forEach((product) => {
        const productIndex = editProd.index;
        if (editProd.query !== "") {
          updatedProducts.splice(productIndex, 1, product);
        } else {
          updatedProducts.push(product);
        }
      });
      return updatedProducts;
    });

    setSelectedProducts([]);
    handelShowDialogBox();
    setEditProd({ index: -1, query: "" });
  }, [
    editProd,
    handelShowDialogBox,
    selectedProducts,
    setEditProd,
    setProducts,
  ]);

  return (
    <div className="bg-white z-20 h-[611px] mt-28 sm:mt-10 w-[95%] sm:w-[50%]">
      <div className="w-full flex justify-between px-2 py-2 sm:px-5 items-center text-black">
        <h2 className="text-lg font-medium">Select products</h2>
        <button onClick={handelShowDialogBox}>
          <X />
        </button>
      </div>
      <hr className="w-full h-1 text-gray-600" />

      <div className="w-full flex justify-center px-2 py-2 sm:px-5 items-center text-black relative">
        <div className="outline-none flex items-center w-[95%] border-gray-400 focus:border-blue-400 border">
          <Search className="text-gray-500 text-md ml-2" />
          <input
            type="text"
            placeholder="Search"
            className="p-2 outline-none w-[95%] border-none"
            onChange={handleSearch}
          />
        </div>
      </div>
      <hr className="w-full h-1 text-gray-600" />

      <div className="w-full h-[450px] overflow-y-scroll flex items-center flex-col">
        {isLoading && (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        )}
        {data && data.length === 0 && (
          <div className="w-full h-full flex justify-center items-center text-md">
            No data available
          </div>
        )}
        {apiProducts &&
          apiProducts.length > 0 &&
          apiProducts.map((product) => (
            <React.Fragment key={product.id}>
              <div className="flex items-center min-h-[45px] px-6 gap-4 py-1 w-[95%]">
                <input
                  type="checkbox"
                  className="w-6 h-6 ml-4 accent-[#008060] "
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onChange={() => handleProductToggle(product.id, product)}
                />
                {product?.image?.src && (
                  <img
                    src={product?.image?.src}
                    alt="product image"
                    className="w-9 h-9 rounded-sm"
                    style={{ filter: "blur(5px)" }}
                    onLoad={(e) => {
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.filter = "none";
                    }}
                    loading="lazy"
                  />
                )}
                <p className="text-base text-black font-normal">
                  {product.title}
                </p>
              </div>
              <hr className="w-full h-1 text-gray-600" />
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-4 px-8 py-1 w-[95%]"
                >
                  <input
                    type="checkbox"
                    className="w-6 h-6 ml-10 accent-[#008060]"
                    checked={selectedProducts.some(
                      (p) =>
                        p.id === product.id &&
                        p.variants.some((v) => v.id === variant.id)
                    )}
                    onChange={() => handleVariantToggle(product.id, variant)}
                  />
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base text-black font-normal">
                      {variant.title}
                    </p>
                    <p className="text-base text-black font-normal">
                      $ {variant.price}
                    </p>
                  </div>
                </div>
              ))}
              <hr className="w-full h-1 text-gray-600" />
            </React.Fragment>
          ))}
      </div>
      <hr className="w-full h-1 text-gray-600" />

      <div className="w-full flex justify-between px-2 py-1 sm:px-5 items-center text-black">
        <h2 className="text-sm font-medium">
          {selectedProducts.length} products selected
        </h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={handelShowDialogBox}
            className="px-2 sm:px-4 py-2 bg-gray-200 text-black text-xs sm:text-sm rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToMainProducts}
            className="px-2 sm:px-4 py-2 bg-[#008060] text-white text-xs sm:text-sm rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDialogBox;
