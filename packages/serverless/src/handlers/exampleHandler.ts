import { Handler, Context } from "aws-lambda";

export const example: Handler = async (event, _context: Context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: {},
        input: event,
      }),
    };
  } catch (error) {
    throw Error(JSON.stringify(error));
  }
};
