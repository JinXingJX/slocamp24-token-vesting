'use client'

import {getTokenvestingProgram, getTokenvestingProgramId, TOKENVESTING_PROGRAM_ID} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'
import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface CreateVestingArgs {
  companyName: string
  mint: string
}

interface CreateEmployeeArgs {
  startTime: number
  endTime: number
  totalAmount: number
  cliffTime: number
}

export function useTokenvestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenvestingProgramId(cluster.network as Cluster), [cluster])
  const program = getTokenvestingProgram(provider)

  const accounts = useQuery({
    queryKey: ['tokenvesting', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const ctreateVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ['vestingAccount', 'create', { cluster }],
    mutationFn: ({companyName,mint}) =>
      program.methods
    .createVestingAccount(companyName)
    .accounts({mint: new PublicKey(mint),tokenProgram:TOKEN_PROGRAM_ID})
    .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create vesting account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    ctreateVestingAccount,
  }
}

export function useTokenvestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts} = useTokenvestingProgram()

  const accountQuery = useQuery({
    queryKey: ['tokenvesting', 'fetch', { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  })

  const createEmployeeVesting = useMutation<string, Error, CreateEmployeeArgs>({
    mutationKey: ['vestingAccount', 'createEmployee', { cluster, account }],
    mutationFn: ({startTime,endTime,totalAmount,cliffTime}) =>
      program.methods
    .createEmployeeAccount(new BN(startTime),new BN(endTime),new BN(totalAmount),new BN(cliffTime))
    .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create employee account'),
  })

  return {
    accountQuery,
    createEmployeeVesting
  }
}
