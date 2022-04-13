import React from "react";
import Products from "../components/ProductCollection";
import clsx from "clsx";
import { InstantSearch, SearchBox, Hits } from "react-instantsearch-dom";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import Hit from "~/components/Hit";

const navigation = [
  { name: "Products", href: "#", current: true },
  { name: "Wishlist", href: "#", current: false },
];

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "fx77g6l4MoVoJWZCER5Qjsse7Dr2T0uo", // Be sure to use the search-only-api-key
    nodes: [
      {
        host: "r6txjgnodhpc40s8p-1.a1.typesense.net",
        port: 443,
        protocol: "https",
      },
    ],
  },
  additionalSearchParameters: {
    query_by: "name, category",
    queryByWeights: "4,2",
    num_typos: 1,
    typoTokensThreshold: 1,
  },
});

const Home: React.VFC<any> = ({
  searchClient = typesenseInstantsearchAdapter.searchClient,
  ...props
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="px-8 mx-auto shadow-sm max-w-7xl">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      item.current
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                      "inline-flex items-center px-2 border-b-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <header className="mb-4">
          <div className="px-8 mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <InstantSearch
            indexName="products"
            {...props}
            searchClient={searchClient}
          >
            <div className="px-8 mx-auto max-w-7xl">
              <SearchBox />
              <Hits hitComponent={Hit} />
            </div>
          </InstantSearch>
        </main>
      </div>
    </div>
  );
};

export default Home;
