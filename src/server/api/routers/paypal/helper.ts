import { TRPCError } from "@trpc/server";
import { log } from "next-axiom";
import { prisma } from "~/server/db";

interface PaypalAccessTokenResponse {
    // comma separated list of scopes
    scope: string,
    access_token: string,
    token_type: 'Bearer',
    app_id: string,
    // seconds until expiry
    expires_in: number,
    nonce: string;
}

export const getPaypalAccessToken = async () => {
    log.info("PAYPAL_ACCESS_TOKEN_REQUESTED");

    const existingTokens = await prisma.paypalAccessToken.findMany({
        select: {
            createdAt: true,
            expires_in: true,
            access_token: true
        },
        where: {
            createdAt: {
                gte: new Date(Date.now() - 3600 * 1000)
            }
        }
    });

    const validTokens = existingTokens.filter(token => new Date(token.createdAt).getTime() + token.expires_in * 1000 > Date.now());

    if (validTokens[0]) {
        log.info("FOUND_EXISTING_VALID_PAYPAL_ACCESS_TOKEN");
        return validTokens[0].access_token;
    }

    const endpoint = "/v1/oauth2/token?grant_type=client_credentials";
    const encodedData = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64');
    const options = {
        "method": "POST",
        "hostname": "api.sandbox.paypal.com",
        "port": null,
        "path": endpoint,
        "headers": {
            "accept": "application/json",
            "accept-language": "en_US",
            "content-type": "application/x-www-form-urlencoded",
            "authorization": `basic ${encodedData}`
        }
    };

    try {
        const res = await fetch(process.env.PAYPAL_URL + endpoint, options);
        const json = await res.json() as PaypalAccessTokenResponse;

        const dbResponse = await prisma.paypalAccessToken.create({
            data: json,
            select: {
                access_token: true,
            }
        });

        log.info("PAYPAL_ACCESS_TOKEN_REQUEST_SUCCESS");

        return dbResponse.access_token;
    } catch (e) {
        log.error("PAYPAL_ACCESS_TOKEN_REQUEST_ERROR: ", { details: e });
        throw new TRPCError({
            message: "Error requesting PayPal access token",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
};