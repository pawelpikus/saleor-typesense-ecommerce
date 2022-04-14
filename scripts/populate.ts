import {
  ApolloClient,
  ApolloQueryResult,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  LatestProductsDocument,
  LatestProductsQuery,
} from "../generated/saleor";
import fetch from "cross-fetch";
import Typesense from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

const client = new ApolloClient({
  link: new HttpLink({ uri: "https://vercel.saleor.cloud/graphql/", fetch }),
  cache: new InMemoryCache(),
  ssrMode: true,
});

const main = async () => {
  const data: ApolloQueryResult<LatestProductsQuery | undefined> =
    await client.query({
      query: LatestProductsDocument,
    });
  const products = data.data?.products?.edges.map(({ node }) => {
    return {
      name: node.name,
      description: node.description,
      image: node.thumbnail?.url,
      category: node.category?.name,
      price: node.pricing?.priceRange?.start?.gross.amount,
    };
  });

  let typesense = new Typesense.Client({
    nodes: [
      {
        host: "f05hglcz7e4ks3x9p-1.a1.typesense.net",
        port: 443,
        protocol: "https",
      },
    ],
    apiKey: "O5MhchvkTPR1PLjF3TvybiMLFow7jP5h",
    connectionTimeoutSeconds: 2,
  });

  let productsSchema: CollectionCreateSchema = {
    name: "products",
    fields: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "price", type: "float" },
      { name: "image", type: "string" },
    ],
  };

  await typesense.collections("products").delete();
  await typesense.collections().create(productsSchema);

  try {
    if (products) {
      await typesense.collections("products").documents().import(products);
    }
  } catch (e) {
    console.log(e);
  }
};

main();
