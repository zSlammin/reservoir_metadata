import axios from "axios";

import * as loot from "./custom/0x79e2d470f950f2cf78eef41720e8ff2cf4b3cd78";

const getTokensMetadata = async (contract, tokenIds) => {
  const searchParams = new URLSearchParams();
  searchParams.append("asset_contract_address", contract);
  for (const tokenId of tokenIds) {
    searchParams.append("token_ids", tokenId);
  }

  const url = `https://rinkeby-api.opensea.io/api/v1/assets?${searchParams.toString()}`;
  const data = await axios.get(url).then((response) => response.data);

  const metadata = [];
  for (const asset of data.assets) {
    metadata.push({
      contract: asset.asset_contract.address,
      token_id: asset.token_id,
      name: asset.name,
      description: asset.description,
      image: asset.image_url,
      attributes: asset.traits.map((trait) => {
        return {
          key: trait.trait_type,
          value: trait.value,
          kind: isNaN(trait.value) ? "string" : "number",
          rank: 1,
        };
      }),
    });
  }

  return metadata;
};

const api = async (req, res) => {
  try {
    const contract = req.query.contract?.toLowerCase();
    const tokenIds = req.query.tokenIds;
    if (!contract || !tokenIds) {
      throw new Error("Missing contract and/or tokenIds");
    }
    if (tokenIds.length > 20) {
      throw new Error("Too many tokens");
    }

    let metadata;
    switch (contract) {
      case "0x79e2d470f950f2cf78eef41720e8ff2cf4b3cd78": {
        metadata = tokenIds.map((tokenId) => loot.getTokenMetadata(tokenId));
        break;
      }

      default: {
        metadata = await getTokensMetadata(contract, tokenIds);
        break;
      }
    }

    return res.status(200).json({ metadata });
  } catch (error) {
    return res.status(500).json({ error: `Internal error: ${error}` });
  }
};

export default api;
