import {
  ApolloClient,
  ApolloQueryResult,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  LatestProductsDocument,
  LatestProductsQuery,
} from "~/generated/saleor";

//@ts-ignore
const Typesense = require("typesense");

const link = createHttpLink({
  uri: "https://vercel.saleor.cloud/graphql/",
  fetch,
});

const client = new ApolloClient({
  uri: "https://vercel.saleor.cloud/graphql/",
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
  });
};

main();
