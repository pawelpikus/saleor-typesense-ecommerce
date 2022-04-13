//@ts-ignore
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

const Typesense = require("typesense");

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
  const typesense = new Typesense.client({
    nodes: [{ host: "localhost", port: "8108", protocol: "http" }],
    apiKey: "xyz",
    connectionTimeoutSeconds: 2,
  });

  const productsSchema = {
    name: "products",
    num_documents: 0,
    fields: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "price", type: "float" },
      { name: "image", type: "string" },
    ],
  };

  await typesense.collections("products").delete();
  await typesense.collections.create(productsSchema);

  try {
    await typesense.collections("products").documents().import(products);
  } catch (e) {
    console.log(e);
  }
};

main();
