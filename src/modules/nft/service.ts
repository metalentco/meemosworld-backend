// alchemy-nft-api/alchemy-web3-script.js
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import fetch from "node-fetch";
import { updateUserNFTVerify } from "../users/service";
const UPDATE_WEBHOOK_URL =
  "https://dashboard.alchemyapi.io/api/update-webhook-addresses";

// const addressList = [
// 	"0x5df4eb771159372A4C33959dF00C7CC6A198Bf06",
// 	"0xbe37e0aa84bbca314ca362ec421468b5dc706d34", // DaBronco
// 	"0xdef93b74e6a7a59afcad5e6cdfe4631d48b93a35", // youcan0
// 	"0xbe863eadd096fe478d3589d6879d15794d729764" // TNY8594
//  "0x495f947276749Ce646f68AC8c248420045cb7b5e" // Chung
//  "0x495f947276749Ce646f68AC8c248420045cb7b5e" // Chung2
//  "0x5A95Cf9C7302d932dA5a6435140F64f3fA8f0b5f" // Nosgnoh
// ]
const DuyAddress = "0x5df4eb771159372A4C33959dF00C7CC6A198Bf06";
const GiangAddress = "0xDeA66CdaAd3c0E911D47B4F7415556E7FC695F13";
const RaiAddress = "0xD50938de76be4E2261205c441c7eF3C193686b8c";
const RaiAddress2 = "0xC6DBd1604A64d01a778d62c8342a6Ba57339016b";
const Chung = "0x8088DCa84e6542910048b014EBa6C092F2CF4f4A";
const Chung2 = "0x9f65018799787c0404F19F9996e39f7c46e330e7";
const GuestAddress = "0x5FED7F6763b8363Df89a8526a53FA30A310ec04C";
const Chung3 = "0x3fff58b5ba100F0E2b006edf9Ca7A68c00CCEf33";
const Chung4 = "0x40e00438F9c8A81171F2BAe052f0d222F2bbFA4B";
const Chung5 = "0x40e00438F9c8A81171F2BAe052f0d222F2bbFA4B";
const Chung6 = "0x9f65018799787c0404F19F9996e39f7c46e330e7";
const Rai2 = "0x8040d8fff55e40726a261aABDC6Eb7434A037086";

const addWebhookAddress = async (publicAddress: string) => {
  console.log("Adding webhook address " + publicAddress);
  const body = {
    webhook_id: process.env.ALCHEMY_WEBHOOK_ID,
    addresses_to_add: [publicAddress],
    addresses_to_remove: [],
  };
  try {
    fetch(UPDATE_WEBHOOK_URL, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: [
        ["Content-Type", "application/json"],
        ["X-Alchemy-Token", `${process.env.ALCHEMY_WEBHOOK_TOKEN}`],
      ],
    })
      .then((res) => res.json())
      .then((json) => console.log("Webhook added : ", json));
  } catch (err) {
    console.error(err);
  }
};

// const remove

const verifyNFTs = async (ownerAddress: string) => {
  const whitelistAddress = [
    RaiAddress,
    DuyAddress,
    Chung2,
    Chung3,
    Chung4,
    Chung5,
    Chung6,
    RaiAddress2,
    Rai2,
    "U1",
    "0x338A6B350BAc4BAa54AF8e943aeBAa698F44Af74", // Robert
    // Chung
  ].map((str) => str.toLowerCase());

  console.log(`🚀 ~ whitelistAddress ${whitelistAddress}`);
  console.log(
    `🚀 ~ whitelistAddress.includes(ownerAddress) ${whitelistAddress.includes(
      ownerAddress
    )}`
  );

  if (whitelistAddress.includes(ownerAddress.toLowerCase())) {
    console.log(`🚀 ~ ${ownerAddress} is in Whitelist`);
    return true;
  }

  // GET list NFT (Meemos collection);
  // const tempDir = join(process.cwd(), '/src/data/nfts.json');
  // const listNft:any = await readFile(tempDir);
  // return JSON.parse(listNft);

  const tokenIds = await getListTokenIdMeemo(ownerAddress);
  if (tokenIds.length > 0) {
    console.log(`🚀 ~ ${ownerAddress} has Meemos NFT`);
    return true;
  } else {
    console.log(`🚀 ~ ${ownerAddress} does not have Meemos NFT`);
    return false;
  }
};
const getListTokenIdMeemo = async (ownerAddress: string) => {
  const contractMeemos = <string>process.env.CONTACT_ADDRESS;
  const ETH_PROVIDER_URL = process.env.ALCHEMY_API_ETH_PROVIDER_URL;
  // Replace with your Alchemy api key:
  const apiKey = process.env.ALCHEMY_API_KEY;
  // const polygonProvider = `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`

  const ethProvider = `${ETH_PROVIDER_URL}/${apiKey}`;

  const web3 = createAlchemyWeb3(ethProvider);

  const nfts = await web3.alchemy.getNfts({
    owner: ownerAddress,
    contractAddresses: [contractMeemos],
  });
  console.log("contractMeemos", contractMeemos);

  console.log(
    "🚀 ~ file: service.ts ~ line 65 ~ verifyNFTs ~ nfts",
    JSON.stringify(nfts)
  );
  // return;

  let result: string[] = [];
  for (const nft of nfts.ownedNfts) {
    result.push(nft.id.tokenId);
  }
  return result;
};

const getImageNft = async (tokenId: string) => {
  const contractMeemos = <string>process.env.CONTACT_ADDRESS;

  if (contractMeemos == "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656") {
    var request = require("request");

    var options = {
      method: "GET",
      url: process.env.URL_METADATA + "/" + contractMeemos + "/" + tokenId,

      headers: { "content-type": "application/json" },
    };
    const myPromise = new Promise((resolve, reject) => {
      request(options, function (error: any, response: any, body: any) {
        const data = JSON.parse(body);
        console.log("getImageNft:", data);

        resolve(data);
      });
    });

    let data: any = await myPromise;

    if (data.success && !data.success) {
      return "";
    }
    return data.image;
  } else {
    const ETH_PROVIDER_URL = process.env.ALCHEMY_API_ETH_PROVIDER_URL;
    const apiKey = process.env.ALCHEMY_API_KEY;
    const ethProvider = `${ETH_PROVIDER_URL}/${apiKey}`;

    const web3 = createAlchemyWeb3(ethProvider);
    const nft = await web3.alchemy.getNftMetadata({
      contractAddress: contractMeemos,
      tokenId: tokenId,
    });
    console.log("nft:", nft);
    if (nft.metadata.image) {
      if (nft.metadata.image.indexOf("ipfs:/") >= 0) {
        const temp = "https://opensea.mypinata.cloud/ipfs/";
        return temp + nft.metadata.image.substring(7);
      } else {
        return nft.metadata.image;
      }
    } else {
      return "";
    }
  }
};

const handleWebhook = async (activity: any) => {
  console.log("🚀 ~ activity", JSON.stringify(activity));
  for (const atvt of activity) {
    // TODO: Need to improve performance
    // only check if Meemos NFT is transfering
    // Reduce complexity
    const { fromAddress } = atvt;
    handleAddressSession(fromAddress);
  }
};

const handleAddressSession = async (address: string) => {
  const tokenIds = await getListTokenIdMeemo(address);
  await updateUserNFTVerify(address, tokenIds);
};

export {
  verifyNFTs,
  addWebhookAddress,
  handleWebhook,
  getListTokenIdMeemo,
  getImageNft,
};
