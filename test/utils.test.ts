import * as chai from "chai";
import { utilExample } from "@/utils";
const { assert } = chai;

describe("src/utils", () => {
  describe("utilExample", () => {
    it("example test", () => {
      const result = utilExample()
      assert.isTrue(result);
    });
  });
});
