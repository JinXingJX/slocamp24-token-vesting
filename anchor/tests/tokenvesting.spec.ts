import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Tokenvesting} from '../target/types/tokenvesting'

describe('tokenvesting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tokenvesting as Program<Tokenvesting>

  const tokenvestingKeypair = Keypair.generate()
})
