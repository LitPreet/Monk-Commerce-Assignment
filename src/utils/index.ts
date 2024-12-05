export function debounce(cb: (...args: any[]) => void, del: number) {
    let timer: number | null = null;
    return function (...args: any[]): void {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            cb(...args)
        }, del)
    }
}

export const fetchProducts = async (query: string, page: number) => {
    const response = await fetch(
      `https://stageapi.monkcommerce.app/task/products/search?search=${query}&page=${page}&limit=10`,
      {
        method: "GET",
        headers: {
          "x-api-key": import.meta.env.VITE_MONK_API_SECRET || "",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  };
  