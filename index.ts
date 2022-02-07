import { MerkleTree } from "./MerkleTree";
import { Reward } from "./types";

const rewardList: Reward[] = [
  { Address: "0xE9bf7285894bB90D155FD707c69032ab6191cAe2", VoteShare: "100" },
  { Address: "0xd1cD2a1d539f044A5ddf03cC197013BE1C43283B", VoteShare: "300" },
  { Address: "0xd7B2243E279FD948BD7E0f3D22138e5BAD0f34dE", VoteShare: "600" },
  //   { Address: "0x4444333333333333333333333333333333333333", VoteShare: "1000" },
  //   { Address: "0x5555333333333333333333333333333333333333", VoteShare: "3000" },
];

const merkleTree = new MerkleTree(rewardList);

// merkleTree.getList().then(console.log);
// merkleTree.getHashesOfLeaves().then(console.log);
// merkleTree.getAllHashes().then(console.log);
// merkleTree.getRoot().then(console.log);
// merkleTree.getMerkleProofOfElementAtIndex(0).then(console.log);
merkleTree.getRootAndTotalVoteShare().then(console.log);
merkleTree.getAllMerkleProofs().then(console.log);
