import { BaseError } from "@zkChainHub/errors";

export default class LambdaError extends BaseError {
  constructor(description: string) {
    super({ name: "LambdaError", description });
  }
};
