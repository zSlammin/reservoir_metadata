import { request, gql } from "graphql-request";
import axios from "axios";
export const extendCollection = async (_chainId, metadata, tokenId) => {

    const superrareSubgraphUrl = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/8QaCygBoQ3XsQq8XxF1i6HPYTUHFFhHB9vrF3KvdRXST`
    
    const superrareCreatorAddressQuery= gql`
        {
            artworks(
              where: {collection_: {id: "${metadata.contract}"}, tokenId: "${tokenId}"}
            ) {
              creator {
                address
              }
            }
          }`
    await request(superrareSubgraphUrl, superrareCreatorAddressQuery).then(async (data) => {

        const creatorAddress = data.artworks[0].creator.address

        metadata.id = `${metadata.contract}:superrare-shared-${creatorAddress}`;

        await axios.get(metadata.tokenURI).then((rawMetadata) => {
            console.log(rawMetadata)
            metadata.name = `SuperRare 1/1s ${rawMetadata.data.createdBy}`
        })
    }).catch((e)=> {

        console.error("superrare indexing failed due to %0", e)
            return {
                ...metadata
            }
        }
    )
    return metadata
}

export const extend = async (_chainId, metadata) => {

    const superrareSubgraphUrl = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/8QaCygBoQ3XsQq8XxF1i6HPYTUHFFhHB9vrF3KvdRXST`
    
    const superrareCreatorAddressQuery= gql`
        {
            artworks(
              where: {collection_: {id: "${metadata.contract}"}, tokenId: "${metadata.tokenId}"}
            ) {
              creator {
                id
              }
            }
          }`
    await request(superrareSubgraphUrl, superrareCreatorAddressQuery).then((data => {

        const creatorAddress = data.artworks[0].creator.address
        metadata.collection = `${metadata.contract}:superrare-shared-${creatorAddress}`;
    })).catch((e)=> {

        console.error("superrare indexing failed due to %0", e)
            return {
                ...metadata
            }
        }
    )
    return metadata
}