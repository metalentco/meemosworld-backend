import { NextFunction, Request, Response } from "express";
import { verifyNFTs, addWebhookAddress, handleWebhook } from "./service";

export const verifyNFT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { publicAddress } = req.body;
  try {
    const isHasMeemosNFT = await verifyNFTs(publicAddress);
    console.log(
      "🚀 ~ file: controller.ts ~ line 9 ~ verifyNFT ~ isHasMeemosNFT",
      isHasMeemosNFT
    );
    res.send({
      isHasMeemosNFT,
    });
  } catch (error: any) {
    console.log(
      "🚀 ~ file: controller.ts ~ line 15 ~ verifyNFT ~ error",
      error
    );
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addWebhookAddr = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { publicAddress } = req.query;
  try {
    const resp = await addWebhookAddress(<string>publicAddress);
    console.log(
      "🚀 ~ file: controller.ts ~ line 25 ~ addWebhookAddr ~ resp",
      resp
    );
    res.send({
      resp,
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.ts ~ line 30 ~ addWebhookAddr ~ error",
      error
    );
    res.send({
      error,
    });
  }
};

export const webhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
  	await handleWebhook(body.activity);
  } catch (error) {
  	console.log("🚀 ~ file: controller.ts ~ line 30 ~ addWebhookAddr ~ error", error)
  }
  next();
};
