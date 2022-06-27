import axios from "axios";
import { ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import MerkleTree from "merkletreejs";

interface IWhitelistManager {
  addresses: string[];
  root: string;
  cid: string;
  tree: MerkleTree;
}

const getRootFromTree = (tree) => "0x" + tree.getRoot().toString("hex");

class WhitelistManagement {
  whitelist: IWhitelistManager;
  constructor(addresses) {
    if (addresses.length > 0) {
      this.setWhitelist(addresses);
    } else {
      this.whitelist = {
        tree: null,
        root: ethers.constants.HashZero,
        addresses: addresses,
        cid: null, // this is only for now, should be replace with correct IPFS hash
      };
    }
  }

  addWhitelist = (addresses) => {
    const uniqueAddresses = addresses.filter(
      (address) => this.whitelist.addresses.indexOf(address) === -1
    );
    const newWhitelistAddress = [
      ...this.whitelist.addresses,
      ...uniqueAddresses,
    ];
    this.setWhitelist(newWhitelistAddress);
  };

  removeWhitelist = (addresses) => {
    const filteredAddresses = this.whitelist.addresses.filter(
      (address) => addresses.indexOf(address) === -1
    );
    this.setWhitelist(filteredAddresses);
  };

  getRoot = () => {
    return this.whitelist.root;
  };

  getProof = (address) => {
    const leaf = ethers?.utils?.keccak256(address);
    return this.whitelist.tree.getHexProof(leaf);
  };

  setWhitelist = (addresses) => {
    const leafs = addresses.map((entry) => ethers.utils.keccak256(entry));
    const tree = new MerkleTree(leafs, keccak256, { sortPairs: true });
    this.whitelist = {
      tree,
      root: getRootFromTree(tree),
      addresses: addresses,
      cid: null, // this is only for now, should be replace with correct IPFS hash
    };
  };
}

export default WhitelistManagement;
