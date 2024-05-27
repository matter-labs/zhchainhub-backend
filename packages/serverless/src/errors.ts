import { BaseError } from "@hyperhub/errors";

export default class LambdaError extends BaseError {
  constructor(description: string) {
    super({ name: "LambdaError", description });
  }
};
