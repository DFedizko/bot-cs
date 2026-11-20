import { EnvZodAdapter } from "./packages/external/environment/env.zod-adapter";
import { RootContainer } from "./composition-root/root-container";
import { Bootstrap } from "./composition-root/bootstrap";

const env = new EnvZodAdapter().load();

await new Bootstrap(new RootContainer(env)).run();
