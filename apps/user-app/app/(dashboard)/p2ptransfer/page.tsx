"use client"

import { Button } from "@repo/ui/button";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../../lib/actions/p2pTransfer";

export default function() {

    const [number,setNumber] = useState("")
    const [amount,setAmount] = useState("")
    return <div className="flex justify-center  h-screen w-full">
        <div className="flex justify-center flex-col  ">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <div className="p-2 font-semibold text-xl">Transfer Money</div>
                <TextInput label="Mobile no." placeholder="mobile" onChange={(e)=>{setNumber(e)}}/>
                <TextInput label="Amount(Rs)" placeholder="amount" onChange={(e)=>{setAmount(e)}}/>
                <div className="h-5"></div>
                <Button onClick={async() => {
                await p2pTransfer(number,Number(amount)*100)
                }}>Send</Button>
            </div>
        </div>
    </div>
}