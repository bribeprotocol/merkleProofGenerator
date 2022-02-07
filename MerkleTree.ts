import Web3 from "web3";
const web3 = new Web3();

import BigNumber from "bignumber.js";

import { MerkleProof, Reward, RootAndTotalVotes } from "./types";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const zeroAmount = "0";

export class MerkleTree {
  private list: string[];
  private allHashes: string[][];
  private set: Set<string>;
  private totalVoteShare: string;

  constructor(rewardList: Reward[]) {
    let tempList: Reward[];
    this.set = new Set();
    if (rewardList.length % 2 == 0) {
      tempList = rewardList;
    } else {
      tempList = rewardList;
      tempList.push({ Address: zeroAddress, VoteShare: zeroAmount });
    }
    let _tempList = tempList.map((a) =>
      web3.eth.abi.encodeParameters(
        ["uint256", "address"],
        [a.VoteShare, a.Address]
      )
    );
    this.totalVoteShare = rewardList
      .reduce(
        (accumulator, currentValue) => accumulator.plus(currentValue.VoteShare),
        new BigNumber(0)
      )
      .toString();

    for (let index = 0; index < rewardList.length; index++) {
      const element = rewardList[index];
      if (this.set.has(element.Address)) {
        throw new Error("Duplicate address in list");
      }
      this.set.add(element.Address);
    }
    this.list = _tempList;
    this.allHashes = [];

    let currentLevelHashes = this._getHashesOfLeaves();
    let n = currentLevelHashes.length;
    this.allHashes.push(currentLevelHashes);

    while (n != 1) {
      let newLevelHashes: string[] = [];
      for (let index = 0; index < currentLevelHashes.length - 1; index += 2) {
        let element1 = currentLevelHashes[index];
        let element2 = currentLevelHashes[index + 1];
        // console.log({index, currentLevelHashes: currentLevelHashes.length});
        newLevelHashes.push(this.getParent(element1, element2));
      }
      currentLevelHashes = newLevelHashes;
      n = newLevelHashes.length;
      if (n % 2 == 1 && n > 1) {
        let lastElement = newLevelHashes[newLevelHashes.length - 1];
        newLevelHashes.push(lastElement);
      }
      this.allHashes.push(newLevelHashes);
    }
  }

  public async getAllMerkleProofs(): Promise<MerkleProof[]> {
    let proofs: MerkleProof[] = [];
    for (let index = 0; index < this.list.length; index++) {
      proofs.push(await this.getMerkleProofOfElementAtIndex(index));
    }
    return proofs;
  }

  public async getMerkleProofOfElementAtIndex(
    index: number
  ): Promise<MerkleProof> {
    if (index >= this.list.length) {
      throw new Error("Merkle Proof out of bound");
    }
    let result = {} as MerkleProof;
    result.data = this.list[index];
    result.hash = this._getHashesOfLeaves()[index];
    let currentHash = result.hash;
    let proof: string[] = [];
    for (let index = 0; index < this.allHashes.length; index++) {
      const allHashesOfLevel = this.allHashes[index];
      if (allHashesOfLevel.length == 1) {
        result.root = allHashesOfLevel[0];
      } else {
        let companionHash = this.getCompanionHash(currentHash, index);
        proof.push(companionHash);
        currentHash = this.getParent(currentHash, companionHash);
      }
    }
    result.proof = proof;
    return result;
  }

  public async getList(): Promise<string[]> {
    return this.list;
  }

  public async getAllHashes(): Promise<string[][]> {
    return this.allHashes;
  }

  public async getHashesOfLeaves(): Promise<string[]> {
    return this._getHashesOfLeaves();
  }

  public async getRoot(): Promise<string> {
    let lastLevel = this.allHashes[this.allHashes.length - 1];
    return lastLevel[0];
  }

  public async getRootAndTotalVoteShare(): Promise<RootAndTotalVotes> {
    return {
      root: await this.getRoot(),
      totalVoteShare: this.totalVoteShare,
    };
  }

  private _getHashesOfLeaves(): string[] {
    return this.list.map((a) => web3.utils.keccak256(a));
  }

  private getParent(nodeA: string, nodeB: string): string {
    let numberA = new BigNumber(nodeA, 16);
    let numberB = new BigNumber(nodeB, 16);
    let preImage: string;
    if (numberA.lt(numberB)) {
      preImage = nodeA.split("x")[1] + nodeB.split("x")[1];
    } else {
      preImage = nodeB.split("x")[1] + nodeA.split("x")[1];
    }

    return web3.utils.keccak256("0x" + preImage);
  }

  private getCompanionHash(hash: string, level: number): string {
    let allHashesOfLevel = this.allHashes[level];
    let indexOfHash = allHashesOfLevel.indexOf(hash);
    if (indexOfHash == -1) {
      throw new Error("hash not found in the level");
    }
    if (indexOfHash % 2 == 0) {
      return allHashesOfLevel[indexOfHash + 1];
    } else {
      return allHashesOfLevel[indexOfHash - 1];
    }
  }
}
