import { Area } from "../core/domain/index.js";
import type { AgoraArea } from "./area.js";
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

export type RegionalLlmVendor<TArea extends AgoraArea> = TArea extends Area.CN ? CNLlmVendor : GlobalLlmVendor;

export type RegionalTtsVendor<TArea extends AgoraArea, SR extends number = number> =
    TArea extends Area.CN ? CNTtsVendor<SR> : GlobalTtsVendor<SR>;

export type RegionalSttVendor<TArea extends AgoraArea> = TArea extends Area.CN ? CNSttVendor : GlobalSttVendor;

export type RegionalAvatarVendor<TArea extends AgoraArea, SR extends number = number> =
    TArea extends Area.CN ? CNAvatarVendor<SR> : GlobalAvatarVendor<SR>;
