/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stable_coin.json`.
 */
export type StableCoin = {
  "address": "2sQVjGfQRse5n4e8vdJEdfqnsbFQ3YfEawEwmKKkzneS",
  "metadata": {
    "name": "stableCoin",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "depositAndMintTokens",
      "discriminator": [
        206,
        253,
        229,
        95,
        198,
        174,
        11,
        109
      ],
      "accounts": [
        {
          "name": "depositer",
          "writable": true,
          "signer": true
        },
        {
          "name": "collateralAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "depositer"
              }
            ]
          }
        },
        {
          "name": "solTokenAccount",
          "docs": [
            "SAFETY: This account is only used as a recipient for SOL transfers.",
            "The seeds ensure that the PDA is derived deterministically and cannot be arbitrarily passed in by the client."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "depositer"
              }
            ]
          }
        },
        {
          "name": "depositerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "depositer"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "priceUpdate"
        },
        {
          "name": "tokenProgram2022"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "liquidate",
      "discriminator": [
        223,
        179,
        226,
        125,
        48,
        46,
        39,
        74
      ],
      "accounts": [
        {
          "name": "liquidator",
          "writable": true,
          "signer": true
        },
        {
          "name": "collateralAccount",
          "writable": true
        },
        {
          "name": "solAccount",
          "writable": true,
          "relations": [
            "collateralAccount"
          ]
        },
        {
          "name": "liquidatorTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "liquidator"
              }
            ]
          }
        },
        {
          "name": "config",
          "docs": [
            "SAFETY: This account is only used as a recipient for SOL transfers.",
            "The seeds ensure that the PDA is derived deterministically and cannot be arbitrarily passed in by the client."
          ],
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "priceUpdate"
        },
        {
          "name": "tokenProgram2022"
        }
      ],
      "args": [
        {
          "name": "coinAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "processConfig",
      "discriminator": [
        158,
        126,
        68,
        104,
        123,
        107,
        55,
        113
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  99,
                  107,
                  101,
                  100,
                  95,
                  110,
                  101,
                  114,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "pubkey"
        },
        {
          "name": "mintAddress",
          "type": "pubkey"
        },
        {
          "name": "liqThx",
          "type": "u64"
        },
        {
          "name": "liqBonus",
          "type": "u64"
        },
        {
          "name": "minHealthFactor",
          "type": "u64"
        },
        {
          "name": "bumpMintAcc",
          "type": "u8"
        },
        {
          "name": "closeFactor",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBurn",
      "discriminator": [
        192,
        75,
        17,
        80,
        255,
        62,
        228,
        85
      ],
      "accounts": [
        {
          "name": "withdrawer",
          "writable": true,
          "signer": true
        },
        {
          "name": "withdrawerCollateralAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "withdrawer"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "withdrawCollateralTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "withdrawer"
              }
            ]
          }
        },
        {
          "name": "withdrawSolAccount",
          "docs": [
            "SAFETY: This account is only used as a recipient for SOL transfers.",
            "The seeds ensure that the PDA is derived deterministically and cannot be arbitrarily passed in by the client."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  97,
                  116,
                  101,
                  114,
                  97,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "withdrawer"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "priceUpdate"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "collateral",
      "discriminator": [
        123,
        130,
        234,
        63,
        255,
        240,
        255,
        92
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "priceUpdateV2",
      "discriminator": [
        34,
        241,
        35,
        99,
        157,
        126,
        244,
        205
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "customError",
      "msg": "Custom error message"
    },
    {
      "code": 6001,
      "name": "healthFactorError",
      "msg": "Account not healthy"
    },
    {
      "code": 6002,
      "name": "maxLiquidationAmount",
      "msg": "Cannot Liquidate more than the close factor"
    }
  ],
  "types": [
    {
      "name": "collateral",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositer",
            "type": "pubkey"
          },
          {
            "name": "solAccount",
            "type": "pubkey"
          },
          {
            "name": "coinTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "lamports",
            "type": "u64"
          },
          {
            "name": "coins",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpSolAccount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "mintAddress",
            "type": "pubkey"
          },
          {
            "name": "liqThx",
            "type": "u64"
          },
          {
            "name": "liqBonus",
            "type": "u64"
          },
          {
            "name": "minHealthFactor",
            "type": "u64"
          },
          {
            "name": "closeFactor",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpMintAcc",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "priceFeedMessage",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "docs": [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "price",
            "type": "i64"
          },
          {
            "name": "conf",
            "type": "u64"
          },
          {
            "name": "exponent",
            "type": "i32"
          },
          {
            "name": "publishTime",
            "docs": [
              "The timestamp of this price update in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "prevPublishTime",
            "docs": [
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
              "migrated over to a recent version of pyth-agent."
            ],
            "type": "i64"
          },
          {
            "name": "emaPrice",
            "type": "i64"
          },
          {
            "name": "emaConf",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceUpdateV2",
      "docs": [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "writeAuthority",
            "type": "pubkey"
          },
          {
            "name": "verificationLevel",
            "type": {
              "defined": {
                "name": "verificationLevel"
              }
            }
          },
          {
            "name": "priceMessage",
            "type": {
              "defined": {
                "name": "priceFeedMessage"
              }
            }
          },
          {
            "name": "postedSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "verificationLevel",
      "docs": [
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
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "partial",
            "fields": [
              {
                "name": "numSignatures",
                "type": "u8"
              }
            ]
          },
          {
            "name": "full"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "collateralseed",
      "type": "bytes",
      "value": "[99, 111, 108, 108, 97, 116, 101, 114, 97, 108]"
    },
    {
      "name": "mintseed",
      "type": "bytes",
      "value": "[109, 105, 110, 116]"
    },
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    },
    {
      "name": "solUsdcFeedId",
      "type": "string",
      "value": "\"ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d\""
    },
    {
      "name": "tokenMetadataProgramId",
      "type": "string",
      "value": "\"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s\""
    }
  ]
};
