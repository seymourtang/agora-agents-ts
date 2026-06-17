import type { BaseAvatar, BaseCNAvatar, BaseCNLLM, BaseCNSTT, BaseCNTTS, BaseLLM, BaseSTT, BaseTTS } from "./vendors/base.js";
import type { MicrosoftCNSampleRate, MicrosoftCNSTT, MicrosoftCNTTS } from "./vendors/cn.js";
import type { CustomLLM } from "./vendors/llm.js";

export type GlobalLlmVendor = BaseLLM;
export type GlobalTtsVendor<SR extends number = number> = BaseTTS<SR>;
export type GlobalSttVendor = BaseSTT;
export type GlobalAvatarVendor<SR extends number = number> = BaseAvatar<SR>;

export type CNLlmVendor = BaseCNLLM | CustomLLM;
export type CNTtsVendor<SR extends number = number> =
    | BaseCNTTS<SR>
    | (SR extends MicrosoftCNSampleRate ? MicrosoftCNTTS<SR> : never);
export type CNSttVendor = BaseCNSTT | MicrosoftCNSTT;
export type CNAvatarVendor<SR extends number = number> = BaseCNAvatar<SR>;

export type LlmVendor = GlobalLlmVendor | CNLlmVendor;
export type TtsVendor<SR extends number = number> = GlobalTtsVendor<SR> | CNTtsVendor<SR>;
export type SttVendor = GlobalSttVendor | CNSttVendor;
export type AvatarVendor<SR extends number = number> = GlobalAvatarVendor<SR> | CNAvatarVendor<SR>;
