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
import Typesense from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
require("dotenv").config();

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
        host: process.env.TYPESENSE_HOST,
        port: process.env.TYPESENSE_PORT || 0,
        protocol: "https",
      },
    ],
    apiKey: process.env.ADMIN_API_KEY,
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
