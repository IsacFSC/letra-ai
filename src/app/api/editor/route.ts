import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./../../editor/core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});