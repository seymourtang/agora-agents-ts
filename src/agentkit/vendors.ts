import { Area } from "../core/domain/index.js";
import type { AgoraArea } from "./area.js";
import type { CNAvatarVendor, CNLlmVendor, CNSttVendor, CNTtsVendor, GlobalAvatarVendor, GlobalLlmVendor, GlobalSttVendor, GlobalTtsVendor } from "./region-vendors.js";
import {
    AliyunLLM,
    BytedanceDuplexTTS,
    BytedanceLLM,
    BytedanceTTS,
    CosyVoiceTTS,
    DeepSeekLLM,
    FengmingSTT,
    MicrosoftCNSampleRate,
    MicrosoftCNSTT,
    MicrosoftCNTTS,
    MiniMaxCNTTS,
    SensetimeAvatar,
    StepFunTTS,
    TencentLLM,
    TencentSTT,
    TencentTTS,
    XfyunBigModelSTT,
    XfyunDialectSTT,
    XfyunSTT,
    type AliyunLLMOptions,
    type BytedanceDuplexTTSOptions,
    type BytedanceLLMOptions,
    type BytedanceTTSOptions,
    type CosyVoiceTTSOptions,
    type DeepSeekLLMOptions,
    type MicrosoftCNSTTOptions,
    type MicrosoftCNTTSOptions,
    type MiniMaxCNTTSOptions,
    type SensetimeAvatarOptions,
    type StepFunTTSOptions,
    type TencentLLMOptions,
    type TencentSTTOptions,
    type TencentTTSOptions,
    type XfyunBigModelSTTOptions,
    type XfyunDialectSTTOptions,
    type XfyunSTTOptions,
} from "./vendors/cn.js";
import {
    AmazonBedrock,
    Anthropic,
    AzureOpenAI,
    CustomLLM,
    Dify,
    Gemini,
    Groq,
    OpenAI,
    VertexAILLM,
    type AmazonBedrockOptions,
    type AnthropicOptions,
    type AzureOpenAIOptions,
    type CustomLLMOptions,
    type DifyOptions,
    type GeminiOptions,
    type GroqOptions,
    type OpenAIOptions,
    type VertexAILLMOptions,
} from "./vendors/llm.js";
import { AkoolAvatar, AnamAvatar, GenericAvatar, HeyGenAvatar, LiveAvatarAvatar, type AkoolAvatarOptions, type AnamAvatarOptions, type GenericAvatarOptions, type HeyGenAvatarOptions, type LiveAvatarAvatarOptions } from "./vendors/avatar.js";
import {
    AresSTT,
    AmazonSTT,
    AssemblyAISTT,
    DeepgramSTT,
    GoogleSTT,
    MicrosoftSTT,
    OpenAISTT,
    SarvamSTT,
    SpeechmaticsSTT,
    type AmazonSTTOptions,
    type AresSTTOptions,
    type AssemblyAISTTOptions,
    type DeepgramSTTOptions,
    type GoogleSTTOptions,
    type MicrosoftSTTOptions,
    type OpenAISTTOptions,
    type SarvamSTTOptions,
    type SpeechmaticsSTTOptions,
} from "./vendors/stt.js";
import {
    AmazonTTS,
    CartesiaTTS,
    DeepgramTTS,
    ElevenLabsTTS,
    FishAudioTTS,
    GoogleTTS,
    HumeAITTS,
    MicrosoftTTS,
    MiniMaxTTS,
    MurfTTS,
    OpenAITTS,
    RimeTTS,
    SarvamTTS,
    type AmazonTTSOptions,
    type CartesiaTTSOptions,
    type DeepgramTTSOptions,
    type ElevenLabsTTSOptions,
    type FishAudioTTSOptions,
    type GoogleTTSOptions,
    type HumeAITTSOptions,
    type MicrosoftTTSOptions,
    type MiniMaxTTSOptions,
    type MurfTTSOptions,
    type OpenAITTSOptions,
    type RimeTTSOptions,
    type SarvamTTSOptions,
} from "./vendors/tts.js";
import type { CartesiaSampleRate, ElevenLabsSampleRate, GoogleTTSSampleRate, MicrosoftSampleRate } from "./vendors/base.js";

export interface GlobalVendorFactories {
    stt: {
        deepgram(options?: DeepgramSTTOptions): GlobalSttVendor;
        speechmatics(options: SpeechmaticsSTTOptions): GlobalSttVendor;
        microsoft(options: MicrosoftSTTOptions): GlobalSttVendor;
        openai(options: OpenAISTTOptions): GlobalSttVendor;
        google(options: GoogleSTTOptions): GlobalSttVendor;
        amazon(options: AmazonSTTOptions): GlobalSttVendor;
        assemblyai(options: AssemblyAISTTOptions): GlobalSttVendor;
        ares(options?: AresSTTOptions): GlobalSttVendor;
        sarvam(options: SarvamSTTOptions): GlobalSttVendor;
    };
    llm: {
        openai(options: OpenAIOptions): GlobalLlmVendor;
        azureOpenai(options: AzureOpenAIOptions): GlobalLlmVendor;
        anthropic(options: AnthropicOptions): GlobalLlmVendor;
        gemini(options: GeminiOptions): GlobalLlmVendor;
        groq(options: GroqOptions): GlobalLlmVendor;
        vertexAi(options: VertexAILLMOptions): GlobalLlmVendor;
        amazonBedrock(options: AmazonBedrockOptions): GlobalLlmVendor;
        dify(options: DifyOptions): GlobalLlmVendor;
        custom(options: CustomLLMOptions): GlobalLlmVendor;
    };
    tts: {
        elevenlabs<SR extends ElevenLabsSampleRate>(options: ElevenLabsTTSOptions<SR>): GlobalTtsVendor<SR>;
        microsoft<SR extends MicrosoftSampleRate>(options: MicrosoftTTSOptions<SR>): GlobalTtsVendor<SR>;
        openai(options: OpenAITTSOptions): GlobalTtsVendor;
        cartesia<SR extends CartesiaSampleRate>(options: CartesiaTTSOptions<SR>): GlobalTtsVendor<SR>;
        google<SR extends GoogleTTSSampleRate>(options: GoogleTTSOptions<SR>): GlobalTtsVendor<SR>;
        amazon(options: AmazonTTSOptions): GlobalTtsVendor;
        deepgram(options: DeepgramTTSOptions): GlobalTtsVendor;
        humeai(options: HumeAITTSOptions): GlobalTtsVendor;
        rime(options: RimeTTSOptions): GlobalTtsVendor;
        fishaudio(options: FishAudioTTSOptions): GlobalTtsVendor;
        minimax(options: MiniMaxTTSOptions): GlobalTtsVendor;
        murf(options: MurfTTSOptions): GlobalTtsVendor;
        sarvam(options: SarvamTTSOptions): GlobalTtsVendor;
    };
    avatar: {
        liveavatar(options: LiveAvatarAvatarOptions): GlobalAvatarVendor;
        heygen(options: HeyGenAvatarOptions): GlobalAvatarVendor;
        akool(options: AkoolAvatarOptions): GlobalAvatarVendor;
        anam(options: AnamAvatarOptions): GlobalAvatarVendor;
        generic(options: GenericAvatarOptions): GlobalAvatarVendor;
    };
}

export interface CNVendorFactories {
    stt: {
        fengming(): CNSttVendor;
        tencent(options: TencentSTTOptions): CNSttVendor;
        microsoft(options: MicrosoftCNSTTOptions): CNSttVendor;
        xfyun(options: XfyunSTTOptions): CNSttVendor;
        xfyunBigmodel(options: XfyunBigModelSTTOptions): CNSttVendor;
        xfyunDialect(options: XfyunDialectSTTOptions): CNSttVendor;
    };
    llm: {
        aliyun(options: AliyunLLMOptions): CNLlmVendor;
        bytedance(options: BytedanceLLMOptions): CNLlmVendor;
        deepseek(options: DeepSeekLLMOptions): CNLlmVendor;
        tencent(options: TencentLLMOptions): CNLlmVendor;
        custom(options: CustomLLMOptions): CNLlmVendor;
    };
    tts: {
        minimax(options: MiniMaxCNTTSOptions): CNTtsVendor;
        tencent(options: TencentTTSOptions): CNTtsVendor;
        bytedance(options: BytedanceTTSOptions): CNTtsVendor;
        microsoft<SR extends MicrosoftCNSampleRate>(options: MicrosoftCNTTSOptions<SR>): CNTtsVendor<SR>;
        cosyvoice(options: CosyVoiceTTSOptions): CNTtsVendor;
        bytedanceDuplex(options: BytedanceDuplexTTSOptions): CNTtsVendor;
        stepfun(options: StepFunTTSOptions): CNTtsVendor;
    };
    avatar: {
        sensetime(options: SensetimeAvatarOptions): CNAvatarVendor;
    };
}

export type VendorsForArea<TArea extends AgoraArea> = TArea extends Area.CN ? CNVendorFactories : GlobalVendorFactories;

function createGlobalVendors(): GlobalVendorFactories {
    return {
        stt: {
            deepgram: (options) => new DeepgramSTT(options),
            speechmatics: (options) => new SpeechmaticsSTT(options),
            microsoft: (options) => new MicrosoftSTT(options),
            openai: (options) => new OpenAISTT(options),
            google: (options) => new GoogleSTT(options),
            amazon: (options) => new AmazonSTT(options),
            assemblyai: (options) => new AssemblyAISTT(options),
            ares: (options) => new AresSTT(options),
            sarvam: (options) => new SarvamSTT(options),
        },
        llm: {
            openai: (options) => new OpenAI(options),
            azureOpenai: (options) => new AzureOpenAI(options),
            anthropic: (options) => new Anthropic(options),
            gemini: (options) => new Gemini(options),
            groq: (options) => new Groq(options),
            vertexAi: (options) => new VertexAILLM(options),
            amazonBedrock: (options) => new AmazonBedrock(options),
            dify: (options) => new Dify(options),
            custom: (options) => new CustomLLM(options),
        },
        tts: {
            elevenlabs: (options) => new ElevenLabsTTS(options),
            microsoft: (options) => new MicrosoftTTS(options),
            openai: (options) => new OpenAITTS(options),
            cartesia: (options) => new CartesiaTTS(options),
            google: (options) => new GoogleTTS(options),
            amazon: (options) => new AmazonTTS(options),
            deepgram: (options) => new DeepgramTTS(options),
            humeai: (options) => new HumeAITTS(options),
            rime: (options) => new RimeTTS(options),
            fishaudio: (options) => new FishAudioTTS(options),
            minimax: (options) => new MiniMaxTTS(options),
            murf: (options) => new MurfTTS(options),
            sarvam: (options) => new SarvamTTS(options),
        },
        avatar: {
            liveavatar: (options) => new LiveAvatarAvatar(options),
            heygen: (options) => new HeyGenAvatar(options),
            akool: (options) => new AkoolAvatar(options),
            anam: (options) => new AnamAvatar(options),
            generic: (options) => new GenericAvatar(options),
        },
    };
}

function createCNVendors(): CNVendorFactories {
    return {
        stt: {
            fengming: () => new FengmingSTT(),
            tencent: (options) => new TencentSTT(options),
            microsoft: (options) => new MicrosoftCNSTT(options),
            xfyun: (options) => new XfyunSTT(options),
            xfyunBigmodel: (options) => new XfyunBigModelSTT(options),
            xfyunDialect: (options) => new XfyunDialectSTT(options),
        },
        llm: {
            aliyun: (options) => new AliyunLLM(options),
            bytedance: (options) => new BytedanceLLM(options),
            deepseek: (options) => new DeepSeekLLM(options),
            tencent: (options) => new TencentLLM(options),
            custom: (options) => new CustomLLM(options),
        },
        tts: {
            minimax: (options) => new MiniMaxCNTTS(options),
            tencent: (options) => new TencentTTS(options),
            bytedance: (options) => new BytedanceTTS(options),
            microsoft: (options) => new MicrosoftCNTTS(options),
            cosyvoice: (options) => new CosyVoiceTTS(options),
            bytedanceDuplex: (options) => new BytedanceDuplexTTS(options),
            stepfun: (options) => new StepFunTTS(options),
        },
        avatar: {
            sensetime: (options) => new SensetimeAvatar(options),
        },
    };
}

export function createVendorsForArea<TArea extends AgoraArea>(area: TArea): VendorsForArea<TArea> {
    return (area === Area.CN ? createCNVendors() : createGlobalVendors()) as VendorsForArea<TArea>;
}
