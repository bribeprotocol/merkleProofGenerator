export interface Reward {
  Address: string;
  VoteShare: string;
}

export interface MerkleProof {
  data: string;
  hash: string;
  proof: string[];
  root: string;
}

export interface RootAndTotalVotes {
  root: string;
  totalVoteShare: string;
}
