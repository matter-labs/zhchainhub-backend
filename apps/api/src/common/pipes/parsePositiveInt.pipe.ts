import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

/**
 * A pipe that transforms and validates input strings to positive integers.
 * @implements {PipeTransform<string, number>}
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
    /**
     * Transforms and validates the input value.
     *
     * @param {string} value - The input value to be transformed and validated.
     * @param {ArgumentMetadata} metadata - Metadata about the transformed argument.
     * @returns {number} The parsed positive integer.
     * @throws {BadRequestException} If the input is not a valid positive integer.
     */
    transform(value: string, metadata: ArgumentMetadata): number {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue) || parsedValue < 0) {
            throw new BadRequestException(
                `Validation failed: Parameter ${metadata.data} must be a positive integer`,
            );
        }
        return parsedValue;
    }
}
