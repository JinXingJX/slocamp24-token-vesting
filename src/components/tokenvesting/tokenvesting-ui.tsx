'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useTokenvestingProgram, useTokenvestingProgramAccount } from './tokenvesting-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function TokenvestingCreate() {
  const { ctreateVestingAccount } = useTokenvestingProgram();
  const [company,setCompany] = useState('');
  const [mint,setMint] = useState('');
  const {publicKey} = useWallet();
  

  const isFormValidCheck = company.length > 0 && mint.length > 0 && publicKey;
  
  const handleSubmit = () =>{
    if(publicKey && isFormValidCheck){
      ctreateVestingAccount.mutateAsync({companyName: company,mint: mint})
    }
  };

  if(!publicKey){
    return <div>Please connect your wallet</div>
  }

  return (
    <div>
      <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className='input input-bordered w-full max-w-xs' />
      <input type="text" placeholder="Mint" value={mint} onChange={(e) => setMint(e.target.value)} className='input input-bordered w-full max-w-xs' />
      <button onClick={handleSubmit} className='btn btn-primary' disabled={ctreateVestingAccount.isPending || !isFormValidCheck}>Create new vesting account</button>
    </div>
  )
}

export function TokenvestingList() {
  const { accounts, getProgramAccount } = useTokenvestingProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <TokenvestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function TokenvestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useTokenvestingProgramAccount({
    account,
  });

  const [startTime,setStartTime] = useState(0);
  const [endTime,setEndTime] = useState(0);
  const [amount,setAmount] = useState(0);
  const [cliffTime,setCliffTime] = useState(0);
  const [beneficiary,setBeneficiary] = useState('');

  const companyName = useMemo(
    () => accountQuery.data?.companyName??'',
     [accountQuery.data?.companyName]
    );
  const mint = useMemo(
    () => accountQuery.data?.mint??'', [accountQuery.data?.mint]);

 
  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
      <div className='card-body items-center text-center'>
        <div className='space-y-6'>
          <h2 className='card-title justify-center text-3xl cursor-pointer'
          onClick={() => {
            accountQuery.refetch();
          }}>
            {companyName}
            </h2>
        </div>
        <div className='card-actions justify-around '>
                <input type="text" placeholder="Start Time" value={startTime || ''} onChange={(e) => setStartTime(parseInt(e.target.value))} className='input input-bordered w-full max-w-xs' />
                <input type="text" placeholder="End Time" value={endTime || ''} onChange={(e) => setEndTime(parseInt(e.target.value))} className='input input-bordered w-full max-w-xs' />
                <input type="text" placeholder="Amount" value={amount || ''} onChange={(e) => setAmount(parseInt(e.target.value))} className='input input-bordered w-full max-w-xs' />
                <input type="text" placeholder="Cliff Time" value={cliffTime || ''} onChange={(e) => setCliffTime(parseInt(e.target.value))} className='input input-bordered w-full max-w-xs' />
                <input type="text" placeholder="Beneficiary" value={beneficiary || ''} onChange={(e) => setBeneficiary(e.target.value)} className='input input-bordered w-full max-w-xs' />
          <button className='btn btn-primary' onClick={() => {
              createEmployeeVesting.mutateAsync({beneficiary,startTime,endTime,amount,cliffTime});
          }}>Create Employee Vesting Account</button>
        </div>
      </div>
    </div>
  )
}
