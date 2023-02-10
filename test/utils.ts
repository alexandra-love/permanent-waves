import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

import { parseYoutubeId } from "../utils.ts";

Deno.test("parseYoutubeId", () => {
  const url = parseYoutubeId("https://www.youtube.com/watch?v=ylAF0WNvLx0");

  assertEquals(url, "ylAF0WNvLx0");
});