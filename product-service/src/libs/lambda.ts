import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import middyCors from "@middy/http-cors";

export const middyfy = (handler) => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(middyCors());
}
