
const ProductSkeleton = () => {
  return (
    <>
    <div className="flex items-center min-h-[45px] px-6 gap-4 py-1 w-[95%] animate-pulse">
      <div className="w-6 h-6 ml-4 bg-gray-200 rounded" />
      <div className="w-9 h-9 bg-gray-200 rounded-sm flex-shrink-0" />
      <div className="h-4 bg-gray-200 rounded flex-1" />
    </div>
    <hr className="w-full h-1 text-gray-600" />
  </>
  )
}

export default ProductSkeleton
