import { TrackingCode } from "../value-object";

export interface TrackingCodeGeneratorI {
  generate(year?: number): TrackingCode;
}

export class TrackingCodeGenerator implements TrackingCodeGeneratorI {
  generate(year?: number): TrackingCode {
    return TrackingCode.generate(year);
  }
}
