import type { Area } from "../core/domain/index.js";

export type AgoraArea = Area.US | Area.EU | Area.AP | Area.CN;

export type GlobalArea = Exclude<AgoraArea, Area.CN>;

export type AreaScope<TArea extends AgoraArea> = TArea extends Area.CN ? "cn" : "global";
