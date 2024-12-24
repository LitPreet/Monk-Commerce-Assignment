import { Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProductContext } from "../context/ContextProvider";
import { Product } from "../types";
import { debounce, fetchProducts } from "../utils";
import Loader from "./Loader";
import { useQuery } from "@tanstack/react-query";
import ProductSkeleton from "./ProductSkeleton";

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
  const [searchQuery, setSearchQuery] = useState<string>(editProd.query || "");
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isSearchingEditProduct, setIsSearchingEditProduct] = useState<boolean>(false);
  const productListRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());


  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPage(1);
      setApiProducts([]);
    }, 500),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products", searchQuery, page],
    queryFn: () => fetchProducts(searchQuery, page),
    staleTime: 0,
  });

  // Handle loading more products and finding edit product
  useEffect(() => {
    if (data) {
      let newProducts;
      if (page === 1) {
        newProducts = data;
      } else {
        newProducts = [...apiProducts, ...data];
      }
      setApiProducts(newProducts);
      setHasMore(data.length === 10);

      // If we're looking for an edit product, check if it's in the new data
      if (isSearchingEditProduct && editProd.query) {
        const editProduct = newProducts.find(
          (product: Product) => product.title === editProd.query
        );

        if (editProduct) {
          setIsSearchingEditProduct(false);
          setSelectedProducts([editProduct]);
          // Small delay to ensure DOM is updated
          setTimeout(() => {
            const productElement = document.getElementById(`product-${editProduct.id}`);
            if (productElement) {
              productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        } else if (hasMore) {
          // If product not found and more products exist, load next page
          setPage(prev => prev + 1);
        }
      }
    }
  }, [data, page, editProd.query, isSearchingEditProduct, setSelectedProducts]);

  // Start searching for edit product when dialog opens
  useEffect(() => {
    if (editProd.query) {
      setIsSearchingEditProduct(true);
      setSearchQuery(editProd.query);
      setPage(1);
      setApiProducts([]);
    }
  }, [editProd.query]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isSearchingEditProduct) return;

      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoading && hasMore) {
        setPage(prev => prev + 1);
      }
    },
    [isLoading, hasMore, isSearchingEditProduct]
  );

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
  }, [editProd, handelShowDialogBox, selectedProducts, setEditProd, setProducts]);

  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    const img = new Image();
    img.src = '../assets/images/picture.png';
    img.onload = () => handleImageLoad(imageUrl);
  }, [handleImageLoad]);

  return (
    <div className="bg-white z-20 h-[611px] mt-28 sm:mt-10 w-[95%] sm:w-[50%]">
      <div className="w-full flex justify-between px-2 py-2 sm:px-5 items-center text-black">
        <h2 className="text-lg font-medium">
          {editProd.query ? "Edit product" : "Select products"}
        </h2>
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
            defaultValue={editProd.query}
          />
        </div>
      </div>
      <hr className="w-full h-1 text-gray-600" />

      <div
        className="w-full h-[450px] overflow-y-scroll flex items-center flex-col"
        ref={productListRef}
        onScroll={handleScroll}
      >
          {isLoading && !apiProducts.length ? (
          // Show skeletons when initially loading
          Array.from({ length: 5 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (apiProducts &&
          apiProducts.length > 0 &&
          apiProducts.map((product) => (
            <React.Fragment key={product.id}>
              <div
                id={`product-${product.id}`}
                className={`flex items-center min-h-[45px] px-6 gap-4 py-1 w-[95%] ${
                  editProd.query === product.title ? "bg-blue-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="w-6 h-6 ml-4 accent-[#008060]"
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onChange={() => handleProductToggle(product.id, product)}
                />
                {product?.image?.src && (
                  <img
                    src={product?.image?.src}
                    alt={product.title}
                    className={`w-9 h-9 rounded-sm object-cover transition-opacity duration-200 ${
                      loadedImages.has(product.image.src) ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(product.image.src)}
                    onError={() => handleImageError(product.image.src)}
                    loading="lazy"
                  />
                )}
                <p className="text-base text-black font-normal">{product.title}</p>
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
          )))}
        {}

        {isSearchingEditProduct && (
          <div className="w-full py-4 flex justify-center items-center">
            <Loader />
            <span className="ml-2">Finding product...</span>
          </div>
        )}
        {isLoading && !isSearchingEditProduct && (
          <div className="w-full py-4 flex justify-center items-center">
            <Loader />
          </div>
        )}
        {!isLoading && apiProducts.length === 0 && (
          <div className="w-full h-full flex justify-center items-center text-md">
            No data available
          </div>
        )}
        {!isLoading && !hasMore && apiProducts.length > 0 && !isSearchingEditProduct && (
          <div className="w-full py-4 text-center text-gray-500">
            No more products to load
          </div>
        )}
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