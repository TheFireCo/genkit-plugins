var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { genkitPlugin } from "@genkit-ai/core";
function convexVectorstore(params) {
  const plugin = genkitPlugin(
    "convexVectorstore",
    (params2) => __async(this, null, function* () {
      return {
        // retrievers: params.map((p) => configureDevLocalRetriever(p)),
      };
    })
  );
  return plugin(params);
}
var src_default = convexVectorstore;
export {
  convexVectorstore,
  src_default as default
};
//# sourceMappingURL=index.mjs.map