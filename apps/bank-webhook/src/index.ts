import express from "express";
import db from "@repo/db/client";
import { z } from "zod";

const app = express();
app.use(express.json());

// Define Zod schema for validation
const paymentSchema = z.object({
    token: z.string(),
    user_identifier: z.string().transform(Number),
    amount: z.string().transform(Number)
});

app.post("/hdfcWebhook", async (req, res) => {
    // Validate request body
    const result = paymentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: "Invalid data" });
    }

    const paymentInformation = {
        token: result.data.token,
        userId: result.data.user_identifier,
        amount: result.data.amount
    };

    try {
        await db.$transaction(async (prisma) => {

            const userSuccess = await prisma.onRampTransaction.findFirst({
                where:{
                    token:paymentInformation.token,
                    status:"Success"
                }
            })

            const user = await prisma.balance.findFirst({
                where: {
                    userId: paymentInformation.userId
                }
            });

            if(userSuccess){
                return res.json({msg:"Transaction is already Done  !!! "})
            }

            if(user && !userSuccess ) {
                await prisma.balance.updateMany({
                    where: {
                        userId: paymentInformation.userId
                    },
                    data: {
                        amount: {
                            increment: paymentInformation.amount
                        }
                    }
                });
                res.json({ message: "Captured" });
            } 
            if(!user){
                await prisma.balance.create({
                    data: {
                        userId: paymentInformation.userId,
                        amount: paymentInformation.amount,
                        locked: 0
                    }
                });
                res.json({ message: "Captured" });
            }

            await prisma.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success"
                }
            });
            
        });

        
    } catch (e) {
        console.error("Error while processing webhook:", e);
        res.status(500).json({ message: "Error while processing webhook" });
    }
});

app.listen(3003, () => {
    console.log("Server running on port 3003");
});
