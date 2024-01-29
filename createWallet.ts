import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { isValidSuiAddress, fromHEX, toHEX } from "@mysten/sui.js/utils";
import dotenv from "dotenv";
dotenv.config();

const createSuiWallet = async () => {
  console.log(`
------------------------
    `);
  // Creates a SUI Wallet
  console.log("Creating SUI Wallet");
  const keypair = new Ed25519Keypair();

  const privateKeyHex = Buffer.from(
    keypair.export().privateKey,
    "base64"
  ).toString("hex");
  const address = keypair.toSuiAddress();
  console.log(`Address: ${address}`);
  console.log(`Private Key: ${privateKeyHex}`);
  console.log(`
------------------------
`);
  console.log("Check if is a Valid Sui Address");
  const isValid = isValidSuiAddress(address);
  console.log("Is Valid Sui Address", isValid, "type", typeof isValid);
  console.log("Sui Address is Valid", isValidSuiAddress(address));
  console.log(
    `Check if EVM Chain is Valid on SUI:`,
    isValidSuiAddress("0x2Db0A2F760ff15fC4e8e4B2cC5c15d158136BB70")
  );
  console.log(`
------------------------
`);
  const RecoveredKeypair = Ed25519Keypair.fromSecretKey(fromHEX(privateKeyHex));
  console.log("Recovered Address", RecoveredKeypair.toSuiAddress());
};

createSuiWallet();
