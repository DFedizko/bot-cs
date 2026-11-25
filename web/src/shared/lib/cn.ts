import { createCn } from "cn/config";
import { TYPE_STYLES } from "./type-styles";

export const cn = createCn({
    extend: { classGroups: { "font-size": [{ text: TYPE_STYLES }] } },
});
