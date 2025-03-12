import { Config } from "config/config/config";
declare const _default: {
    info: {};
    /** 动态渲染的组件 */
    components: () => (import("node-karin").InputProps | import("node-karin").InputGroupProps | import("node-karin").RadioGroupProps)[];
    /** 前端点击保存之后调用的方法 */
    save: (config: Config) => {
        success: boolean;
        message: string;
    };
};
export default _default;
