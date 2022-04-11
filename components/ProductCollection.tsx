import { useLatestProductsQuery } from "~/generated/saleor";

function Products() {
  const { loading, error, data } = useLatestProductsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  if (data) {
    const latestProducts = data.products?.edges || [];

    return (
      <ul role="list" className="grid grid-cols-4 gap-4">
        {latestProducts?.length > 0 &&
          latestProducts.map(({ node: { id, name, thumbnail, category } }) => (
            <li key={id} className="relative bg-white">
              <img src={thumbnail?.url} alt={name} />
              <div className="p-2 border-t border-gray-100">
                <p className="block text-lg text-gray-900 truncate">{name}</p>
                <p className="block text-sm font-medium text-gray-500">
                  {category?.name}
                </p>
              </div>
            </li>
          ))}
      </ul>
    );
  }

  return null;
}

export default Products;
