interface JwtPayload {
  [key: string]: unknown;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
}

export * from "./tableTypes";

export * from "./requests/staffRequests";
export * from "./requests/eventRequests";
export * from "./requests/transactionRequests";
export * from "./requests/balanceRequests";
export * from "./requests/itemRequests";
export * from "./requests/standRequests";
export * from "./requests/clientRequests";
export * from "./requests/analyticsRequests";
export * from "./requests/topUpRequests";
export * from "./requests/exportRequests";
export * from "./requests/currenciesRequests";

export * from "./responses/staffResponses";
export * from "./responses/eventResponses";
export * from "./responses/transactionResponses";
export * from "./responses/balanceResponses";
export * from "./responses/itemResponse";
export * from "./responses/standResponses";
export * from "./responses/clientResponses";
export * from "./responses/analyticsResponses";
export * from "./responses/topUpResponses";
export * from "./responses/exportResponses";
export * from "./responses/currenciesResponses";

export type TokenStructure = JwtPayload & {
  memberId: string;
  userClass: number;
  company: string;
  eventId?: string;
  memberName: string;
};
