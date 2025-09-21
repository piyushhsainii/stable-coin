import { before, describe, it } from "node:test";
import { Connection, PublicKey } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { BankrunContextWrapper } from "./fixtures/bankRunContextWrapper.ts";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
// @ts-ignore
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import pkg from "@coral-xyz/anchor";
import type { Program as ProgramType } from "@coral-xyz/anchor";
const { BN, Program } = pkg;
import type { StableCoin } from ".././target/types/stable_coin.ts";
import { Keypair } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet.js";

const IDL = {
  address: "GcpT65KNE5vyyikJNP1MrtWGF6uD7uKkRdN5h4ke2cNe",
  metadata: {
    name: "stable_coin",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "deposit",
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182],
      accounts: [
        {
          name: "price_update",
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "PriceUpdateV2",
      discriminator: [34, 241, 35, 99, 157, 126, 244, 205],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "CustomError",
      msg: "Custom error message",
    },
  ],
  types: [
    {
      name: "PriceFeedMessage",
      repr: {
        kind: "c",
      },
      type: {
        kind: "struct",
        fields: [
          {
            name: "feed_id",
            docs: [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature.",
            ],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "price",
            type: "i64",
          },
          {
            name: "conf",
            type: "u64",
          },
          {
            name: "exponent",
            type: "i32",
          },
          {
            name: "publish_time",
            docs: ["The timestamp of this price update in seconds"],
            type: "i64",
          },
          {
            name: "prev_publish_time",
            docs: [
              "The timestamp of the previous price update. This field is intended to allow users to",
              "identify the single unique price update for any moment in time:",
              "for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.",
              "",
              "Note that there may not be such an update while we are migrating to the new message-sending logic,",
              "as some price updates on pythnet may not be sent to other chains (because the message-sending",
              "logic may not have triggered). We can solve this problem by making the message-sending mandatory",
              "(which we can do once publishers have migrated over).",
              "",
              "Additionally, this field may be equal to publish_time if the message is sent on a slot where",
              "where the aggregation was unsuccesful. This problem will go away once all publishers have",
              "migrated over to a recent version of pyth-agent.",
            ],
            type: "i64",
          },
          {
            name: "ema_price",
            type: "i64",
          },
          {
            name: "ema_conf",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PriceUpdateV2",
      docs: [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted.",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "write_authority",
            type: "pubkey",
          },
          {
            name: "verification_level",
            type: {
              defined: {
                name: "VerificationLevel",
              },
            },
          },
          {
            name: "price_message",
            type: {
              defined: {
                name: "PriceFeedMessage",
              },
            },
          },
          {
            name: "posted_slot",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "VerificationLevel",
      docs: [
        "Pyth price updates are bridged to all blockchains via Wormhole.",
        "Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.",
        "The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,",
        "so we also allow for partial verification.",
        "",
        "This enum represents how much a price update has been verified:",
        "- If `Full`, we have verified the signatures for two thirds of the current guardians.",
        "- If `Partial`, only `num_signatures` guardian signatures have been checked.",
        "",
        "# Warning",
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update.",
      ],
      type: {
        kind: "enum",
        variants: [
          {
            name: "Partial",
            fields: [
              {
                name: "num_signatures",
                type: "u8",
              },
            ],
          },
          {
            name: "Full",
          },
        ],
      },
    },
  ],
  constants: [
    {
      name: "MINTSEED",
      type: "bytes",
      value: "[109, 105, 110, 116]",
    },
    {
      name: "SEED",
      type: "string",
      value: '"anchor"',
    },
    {
      name: "SOL_USDC_FEED_ID",
      type: "string",
      value:
        '"ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"',
    },
  ],
};

describe("testing pyth", () => {
  let connection: Connection;
  let TOKEN: number;
  let SOL_TO_USDC_ACCOUNT: PublicKey;
  // pyth account setup
  before(async () => {
    try {
      console.log("1️⃣ Connecting to devnet...");
      connection = new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed",
      });

      const MINT = "FG5cGLC36PEnoGpGoMZb2QUzt85qdMkzAjL1iempoB4n";
      const sol_usdc_feed_id =
        "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
      const sol_usdc_address = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE";

      console.log("2️⃣ Fetching SOL->USDC account info...");
      const solAccInfo = await connection.getAccountInfo(
        new PublicKey(sol_usdc_address)
      );
      if (!solAccInfo) {
        console.log(solAccInfo);
        throw new Error(`Account ${sol_usdc_address} does not exist`);
      }

      console.log("3️⃣ Starting Anchor...");
      // const anchor = await startAnchor(
      //   "./stable_coin/",
      //   [
      //     {
      //       name: IDL.metadata.name,
      //       programId: new PublicKey(IDL.address),
      //     },
      //   ],
      //   [
      //     {
      //       info: solAccInfo,
      //       address: new PublicKey(sol_usdc_address),
      //     },
      //   ]
      // );

      console.log("4️⃣ Setting up BankrunProvider & Context...");
      // const bankrunProvider = new BankrunProvider(anchor);
      // const bankrunContext = new BankrunContextWrapper(anchor);
      // bankrunContext.connection.toConnection();

      const keypair = Keypair.fromSecretKey(
        Buffer.from([
          166, 160, 12, 30, 7, 151, 84, 30, 126, 243, 245, 247, 103, 160, 15,
          47, 100, 225, 60, 167, 105, 45, 195, 252, 250, 68, 29, 232, 243, 177,
          13, 142, 221, 232, 165, 191, 3, 25, 163, 237, 14, 42, 190, 72, 161,
          12, 46, 34, 167, 233, 159, 138, 235, 114, 141, 137, 79, 96, 73, 100,
          141, 107, 208, 154,
        ])
      );
      const signer = keypair;
      // const banksClient = bankrunProvider.connection;

      interface Signer {
        payer: PublicKey;
        signTransaction(tx: Transaction): Promise<Transaction>;
        signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
      }
      const wallet: Signer = {
        payer: signer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(signer);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          txs.forEach((tx) => tx.sign(signer));
          return txs;
        },
      };

      console.log("5️⃣ Setting up Pyth price feed receiver...");
      const pythSolReceiver = new PythSolanaReceiver({
        connection,
        wallet: wallet,
      });

      SOL_TO_USDC_ACCOUNT = pythSolReceiver.getPriceFeedAccountAddress(
        0,
        sol_usdc_feed_id
      );

      console.log("6️⃣ Preparing mint and user token account...");
      // const signer = bankrunProvider.context.payer;

      TOKEN = 1 * 1_000_000_000; // 1 token with 9 decimals
      const authority = "FwErds4rfGUkz48AF9aYZ8P7Pf1BGdJNa7XJT7BzT3ku";

      // const airdropSig = await connection.requestAirdrop(signer.publicKey, 2e9);
      // await connection.confirmTransaction(airdropSig);

      const mint = await createMint(
        connection,
        signer,
        new PublicKey(authority),
        null,
        9
      );

      const userTokenAccount = await createAssociatedTokenAccount(
        connection,
        signer,
        mint,
        signer.publicKey
      );
      console.log("7️⃣ Minting tokens to user...");
      try {
        await mintTo(connection, signer, mint, userTokenAccount, signer, TOKEN);
      } catch (error) {
        console.log(`MINT ERROR`, error);
      }

      console.log("✅ Setup complete!");
    } catch (err) {
      console.error("❌ Setup failed:", err);
      throw err; // fail the tests if before() fails
    }
  });

  it("check pyth", async () => {
    console.log("hitting");
    // @ts-ignore
    const program: ProgramType<StableCoin> = new Program(IDL, {
      connection,
    });
    try {
      const keypair = Keypair.fromSecretKey(
        Buffer.from([
          166, 160, 12, 30, 7, 151, 84, 30, 126, 243, 245, 247, 103, 160, 15,
          47, 100, 225, 60, 167, 105, 45, 195, 252, 250, 68, 29, 232, 243, 177,
          13, 142, 221, 232, 165, 191, 3, 25, 163, 237, 14, 42, 190, 72, 161,
          12, 46, 34, 167, 233, 159, 138, 235, 114, 141, 137, 79, 96, 73, 100,
          141, 107, 208, 154,
        ])
      );
      const signer = keypair;
      const ix = await program.methods
        .deposit(new BN(TOKEN))
        .accounts({
          priceUpdate: SOL_TO_USDC_ACCOUNT,
        })
        .instruction();
      const bx = await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: signer.publicKey,
        blockhash: bx.blockhash,
        lastValidBlockHeight: bx.lastValidBlockHeight,
      }).add(ix);

      const simulationResult = await connection.simulateTransaction(tx);
      console.log(`Result`, simulationResult);

      console.log(`Instruction`, ix);
    } catch (error) {
      console.log(`Instruction Mesasge`, error);
    }
  });
});
