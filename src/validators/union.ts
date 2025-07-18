import { definePlugin, ValidationError, ValidationContext } from "../types.js";
import { Schema } from "../schemas/schema.js";

export const unionPlugin = definePlugin({
  dataType: "union",
  validate: {
    identity: {
      validator: () => true,
      message: () => "is any",
    },
    variants: {
      validator: async (
        value: unknown,
        schemas: Schema<any, any>[],
        context: ValidationContext
      ) => {
        const issues = [];
        for (const schema of schemas) {
          try {
            await schema.parse(value, context);
            return true; // Stop on first success
          } catch (e) {
            if (e instanceof ValidationError) {
              issues.push(...e.issues);
            } else {
              throw e; // Rethrow unexpected errors
            }
          }
        }

        // If no schema passed, we will fail. We throw here to aggregate issues.
        throw new ValidationError(issues);
      },
      message: (ctx) => `No union variant matched the provided value.`,
    },
  },
});
